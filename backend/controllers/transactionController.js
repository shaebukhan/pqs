const TransactionModel = require("../models/TransactionModel");
const UserModel = require("../models/UserModel");
const createTransporter = require("../config/emailConfig");
const WalletTransactionModel = require("../models/WalletTransactionModel");

const createTransactionController = async (req, res) => {
  const {
    name,
    email,
    userId,
    amount,
    paymentMethod, // 'Fiat' or 'Crypto'
    currency, // For fiat
    asset, // For crypto
    network, // For crypto
    pinCode,
    salesChecked,
    salesPercentage,
    hedgingChecked,
    hedgingPercentage,
  } = req.body;

  const ADMIN_PIN = process.env.ADMIN_PIN || "admin1234";

  // Validate required fields
  if (
    !userId ||
    !amount ||
    !paymentMethod ||
    !pinCode ||
    (paymentMethod === "Fiat" && !currency) ||
    (paymentMethod === "Crypto" && (!asset || !network))
  ) {
    return res
      .status(200)
      .json({ success: false, message: "Required fields are missing." });
  }

  try {
    // Fetch the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found." });
    }

    // Validate admin PIN
    if (ADMIN_PIN !== pinCode) {
      return res
        .status(201)
        .json({ success: false, message: "Invalid PIN code." });
    }

    // Parse amount to ensure it's treated as a number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid amount format." });
    }

    // Calculate fees
    const salesFee = salesChecked ? (salesPercentage / 100) * parsedAmount : 0;
    const hedgingFee = hedgingChecked
      ? (hedgingPercentage / 100) * parsedAmount
      : 0;
    const totalFees = salesFee + hedgingFee;
    const finalAmount = parsedAmount - totalFees;

    let closingBalance = 0;

    // Handle fiat transactions
    if (paymentMethod === "Fiat") {
      let fiatBalance = user.balances.fiat.find((b) => b.currency === currency);

      if (!fiatBalance) {
        // Create a new fiat balance for the specified currency
        fiatBalance = {
          currency,
          availableBalance: finalAmount,
        };
        user.balances.fiat.push(fiatBalance);
      }

      // Ensure numeric addition for fiat balance
      closingBalance =
        parseFloat(fiatBalance.availableBalance || 0) + parsedAmount;
      fiatBalance.availableBalance =
        parseFloat(fiatBalance.availableBalance || 0) + finalAmount;

      // Mark modified to save properly
      user.markModified("balances.fiat");
    }

    // Handle crypto transactions
    else if (paymentMethod === "Crypto") {
      // Check if the crypto asset exists
      let cryptoAsset = user.balances.crypto.find((c) => c.asset === asset);

      if (!cryptoAsset) {
        // Create a new crypto asset with its network
        cryptoAsset = {
          asset,
          networks: [
            {
              networkName: network,
              availableBalance: finalAmount, // Start with the final amount
            },
          ],
        };
        user.balances.crypto.push(cryptoAsset);
        closingBalance = parsedAmount;
      } else {
        // Check if the network exists
        let cryptoNetwork = cryptoAsset.networks.find(
          (n) => n.networkName === network
        );

        if (!cryptoNetwork) {
          // Create a new network for the existing asset
          cryptoNetwork = {
            networkName: network,
            availableBalance: finalAmount, // Start with the final amount
          };
          cryptoAsset.networks.push(cryptoNetwork);
          closingBalance = parsedAmount;
        } else {
          // Ensure numeric addition for the existing network balance
          closingBalance =
            parseFloat(cryptoNetwork.availableBalance || 0) + parsedAmount;
          cryptoNetwork.availableBalance =
            parseFloat(cryptoNetwork.availableBalance || 0) + finalAmount;
        }
      }

      // Mark the balances as modified to ensure changes are saved
      user.markModified("balances.crypto");
    }

    // Save the updated user balance
    await user.save();

    // Create the main transaction
    const mainTransaction = new TransactionModel({
      name,
      email,
      userID: userId,
      amount: parsedAmount,
      paymentMethod,
      currency: paymentMethod === "Fiat" ? currency : undefined,
      asset: paymentMethod === "Crypto" ? asset : undefined,
      network: paymentMethod === "Crypto" ? network : undefined,
      closingBalance: closingBalance, // Updated balance after the deposit
      type: "Deposit",
      status: 1,
    });

    await mainTransaction.save();

    // Create fee transactions if applicable
    if (salesChecked) {
      const salesFeeAmount = parseFloat(
        ((salesPercentage / 100) * parsedAmount).toFixed(4)
      );
      closingBalance = parseFloat((closingBalance - salesFeeAmount).toFixed(4));

      const salesTransaction = new TransactionModel({
        name,
        email,
        userID: userId,
        amount: salesFeeAmount,
        paymentMethod,
        currency: paymentMethod === "Fiat" ? currency : undefined,
        asset: paymentMethod === "Crypto" ? asset : undefined,
        network: paymentMethod === "Crypto" ? network : undefined,
        closingBalance: closingBalance, // Updated balance after the sales fee
        type: "Sales Fee",
        status: 1,
      });
      await salesTransaction.save();
    }

    if (hedgingChecked) {
      const hedgingFeeAmount = parseFloat(
        ((hedgingPercentage / 100) * parsedAmount).toFixed(4)
      );
      closingBalance = parseFloat(
        (closingBalance - hedgingFeeAmount).toFixed(4)
      );

      const hedgingTransaction = new TransactionModel({
        name,
        email,
        userID: userId,
        amount: hedgingFeeAmount,
        paymentMethod,
        currency: paymentMethod === "Fiat" ? currency : undefined,
        asset: paymentMethod === "Crypto" ? asset : undefined,
        network: paymentMethod === "Crypto" ? network : undefined,
        closingBalance: closingBalance, // Updated balance after the hedging fee
        type: "Hedging Fee",
        status: 1,
      });
      await hedgingTransaction.save();
    }

    // Send email notification
    try {
      await sendTransactionEmail(email, name, mainTransaction);
    } catch (emailError) {
      console.error("Error sending transaction email:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Transaction successful!",
      mainTransaction,
    });
  } catch (error) {
    console.error("Transaction error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

//update

// const updateTransactionController = async (req, res) => {
//     try {
//         const { date, account, name, rows } = req.body;
//         const transactionId = req.params.id;

//         const formattedDate = new Date(date).toISOString().split('T')[0];

//         // Update the transaction
//         const updatedTransaction = await TransactionModel.findByIdAndUpdate(transactionId, {
//             date: formattedDate,
//             accountID: account,
//             name
//         }, { new: true }); // Set { new: true } to return the updated document

//         // Delete existing entries for the transaction
//         await EntryModel.deleteMany({ transactionID: transactionId });

//         // Create new entries for the transaction
//         const entries = await Promise.all(rows.map(async (row) => {
//             const { category, amount, comments } = row;
//             const entry = await EntryModel.create({
//                 categoryID: category,
//                 amount,
//                 comments,
//                 transactionID: transactionId,
//             });
//             return entry;
//         }));

//         return res.status(200).send({
//             success: true,
//             message: "Transaction and entries updated successfully",
//             transaction: updatedTransaction,
//             entries,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({
//             success: false,
//             message: "Error in updating transaction and entries",
//             error,
//         });
//     }
// };

// Get all transaction entries controller
const getAllTransactionsController = async (req, res) => {
  try {
    // Fetch all transactions
    const transactions = await TransactionModel.find({});
    if (!transactions || transactions.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "No transactions found" });
    }
    return res.status(200).send({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching transactions with entries",
      error,
    });
  }
};

const getAllTransactionWithWalletController = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(204).json({ success: false, message: "No User Exists" });
  }
  try {
    // Fetch all transactions
    const transactions = await TransactionModel.find({ userID: id });
    if (!transactions || transactions.length === 0) {
      return res
        .status(204)
        .json({ success: false, message: "No transactions found" });
    }

    const transactionsWithWallet = await Promise.all(
      transactions.map(async (transaction) => {
        const transactionWallet = await WalletTransactionModel.findOne({
          transactionId: transaction._id,
        });
        return { ...transaction.toObject(), transactionWallet };
      })
    );

    return res.status(200).json({
      success: true,
      transactions: transactionsWithWallet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in fetching transactions with wallet entries",
      error: error.message,
    });
  }
};

const getAllUserTransactionsController = async (req, res) => {
  try {
    // Fetch all transactions
    const { id } = req.params;
    if (!id) {
      return res
        .status(204)
        .json({ success: false, message: "No User Exists" });
    }
    const transactions = await TransactionModel.find({ userID: id });
    if (!transactions || transactions.length === 0) {
      return res
        .status(204)
        .json({ success: false, message: "No transactions found" });
    }
    return res.status(200).send({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching transactions",
      error,
    });
  }
};

const sendTransactionEmail = async (email, name, mainTransaction) => {
  // Configure the email transport using nodemailer
  const transporter = createTransporter();

  // Email options
  const mailOptions = {
    from: process.env.AUTH_EMAIL_P,
    to: email,
    subject: "Credit Transaction Alert",
    html: `
        <div style="background: #0E2340; text-align: center;">
            <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px;">PQS</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h5 style="color: #333; font-size: 17px; margin-bottom: 5px;">Dear <span >${name}</span>,</h5>
            <p style="color: #333; font-size: 17px; margin-bottom: 5px;">your transaction of ${
              mainTransaction.amount
            }  ${
      mainTransaction.currency || mainTransaction.asset
    }  has been credited to your account.</p>
            <p style="color: #333; font-size: 17px; margin-bottom: 5px;">Below are the transaction details:</p>
             
            <ul style="list-style-type: none; padding: 0; color: #333;">
                <li>Amount: ${mainTransaction.amount}</li>
                ${
                  mainTransaction.currency
                    ? `<li>Currency: ${mainTransaction.currency}</li>`
                    : ""
                }
                ${
                  mainTransaction.asset
                    ? `<li>Asset: ${mainTransaction.asset}</li>`
                    : ""
                }
                ${
                  mainTransaction.network
                    ? `<li>Network: ${mainTransaction.network}</li>`
                    : ""
                }
                <li>Payment Method: ${mainTransaction.paymentMethod}</li>
                <li>Date: ${new Date(
                  mainTransaction.date
                ).toLocaleString()}</li>
            </ul>
            <h5 style="color: #333; font-size: 17px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
            <h6>This is an automated message, please do not reply to this email.</h6>
        </div>`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = {
  createTransactionController,
  getAllTransactionsController,
  getAllUserTransactionsController,
  getAllTransactionWithWalletController,
};
