const currencyModel = require("../models/currencyModel");
const TransactionModel = require("../models/TransactionModel");
const UserModel = require("../models/UserModel");
const WalletModel = require("../models/WalletModel");
const axios = require("axios");
const WalletTransactionModel = require("../models/WalletTransactionModel");
const createTransporter = require("../config/emailConfig");

const addWalletController = async (req, res) => {
  try {
    const { userId, asset, network, wallet } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found." });
    }
    const existingWallet = await WalletModel.findOne({ wallet });
    if (existingWallet) {
      return res.status(200).send({
        success: false,
        message: "Wallet Address Already  in Use !",
      });
    }
    const existingNetwork = await WalletModel.findOne({ network });
    if (existingNetwork) {
      return res.status(200).send({
        success: false,
        message: "Network chain is already present !",
      });
    }
    // Validate data and save it to the database
    const newWallet = await new WalletModel({
      userId,
      asset,
      network,
      wallet,
    });
    // await sendAddWalletEmail(user.email, user.name, wallet);
    await newWallet.save();
    res
      .status(201)
      .send({ success: true, message: "Wallet Address Saved Successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get accounts by user id

const getAllWalletsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found." });
    }

    const wallets = await WalletModel.find({ userId }).select(
      "asset network _id"
    );
    if (!wallets || wallets.length === 0) {
      return res
        .status(201)
        .send({ success: false, message: "No wallets found" });
    }
    return res.status(200).send({
      success: true,
      wallets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getSingleWalletController = async (req, res) => {
  try {
    const { user, asset } = req.query;
    const wallets = await WalletModel.find({ userId: user, asset });
    if (!wallets) {
      return res.status(201).json({ success: false, message: "No data found" });
    }
    return res.status(200).send({
      success: true,
      wallets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
//change currency

const changeCurrencyController = async (req, res) => {
  try {
    const { currency, userId } = req.body;

    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(201)
        .json({ success: false, message: "User not found." });
    }

    // Check if the user already has a currency entry
    const existingCurrency = await currencyModel.findOne({ userId });

    if (existingCurrency) {
      // Update the currency for the existing user
      existingCurrency.currency = currency;
      await existingCurrency.save();
      return res
        .status(200)
        .send({ success: true, message: "Currency updated successfully!" });
    }

    // If no existing currency entry, create a new one
    const newCurrency = await new currencyModel({ userId, currency });
    await newCurrency.save();

    res
      .status(201)
      .send({ success: true, message: "Currency added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

const getCurrencyController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res
        .status(201)
        .json({ success: false, message: "User not found." });
    }

    // Check if the user already has a currency entry
    const currency = await currencyModel.findOne({ userId: id });

    if (!currency) {
      return res
        .status(200)
        .send({ success: false, message: "Currency not Exist !" });
    }

    res.status(201).send({
      success: true,
      currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

//
const sendAddWalletEmail = async (email, name, wallet) => {
  try {
    // Configure the email transport using nodemailer

    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL_P,
      to: email,
      subject: "Beneficiary Management",
      html: `<div style="background: #0E2340; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">PQS</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h5 style="color: #333; font-size: 15px; margin-bottom: 5px;">Dear <span style="text-transform:uppercase;">${name}</span>,</h5>
                <h5 style="color: #333; font-size: 15px; margin-bottom: 5px;">Beneficiary Added successfully.</h5>
    <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Beneficiary Details</h5>  
      
<div style="display: flex; justify-content: space-between;margin-top:10px;">
    <span style="font-size: 17px; width: 50%;">Account No</span>
    <span style="font-size: 17px; width: 50%;">${wallet}</span>
</div>
               
                <p style="font-size:17px">If you do not recognize this login attempt, please immediately Login to our Website    to block the  services.</p>
                <p style="font-size:17px">Please note that PQS will never ask for any confidential information by calling from any number including its official helpline numbers, through emails or websites! Please do not share your confidential details such as  CVV, User Name, Password, OTP etc.</p>
                <p>In case of any complaint, you may contact us through:</p>
                <ul>
                    <li style="font-size:17px">Email: <a href="mailto:support@pqs.com">support@pqs.com</a></li>
                    <li style="font-size:17px">Phone: <a href="tel:+442071675747">+44 2071675747</a></li>
                    <li style="font-size:17px">Websites: <a href="https://www.pqs.com/contact">www.pqs.com/complaint-form/</a></li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
                <p>This is an automated message, please do not reply to this email.</p>
            </div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Error occurred:", error.message);
      }
      console.log("Message sent: %s", info.messageId);
    });
  } catch (error) {
    console.error("Error sending email:", error); // Log the error
    throw new Error("Failed to send email"); // Optional: Throw an error to propagate it further
  }
};

const getWalletTransactions = async () => {
  try {
    // Fetch all user wallets from the database
    const wallets = await WalletModel.find({});
    console.log("Fetched Wallet Addresses:", wallets);

    const currentTime = Date.now();
    const oneMinuteAgo = currentTime - 60000; // 60 seconds ago

    // Loop through each wallet address
    for (const wallet of wallets) {
      console.log(`Checking transactions for wallet: ${wallet.wallet}`);

      // Fetch TRC20 transactions from Tatum API
      const response = await axios.get(
        `https://api.tatum.io/v3/tron/transaction/account/${wallet.wallet}/trc20`,
        { headers: { "x-api-key": process.env.TATUM_API_KEY } }
      );

      const trc20Transactions = response.data.transactions;

      // Extract txIDs to fetch timestamps separately
      const txIDs = trc20Transactions.map((tx) => tx.txID);
      const transactionMap = new Map();

      // Fetch timestamps for each txID from the second API
      for (const txID of txIDs) {
        try {
          const responseC = await axios.get(
            `https://api.tatum.io/v3/tron/transaction/${txID}`,
            { headers: { "x-api-key": process.env.TATUM_API_KEY } }
          );

          const timestamp =
            responseC.data.rawData?.timestamp || responseC.data.timestamp;

          // Store TRC20 transaction details with the correct timestamp
          const tx = trc20Transactions.find((t) => t.txID === txID);
          transactionMap.set(txID, {
            txID: tx.txID,
            from: tx.from,
            to: tx.to,
            amount: parseFloat((Number(tx.value) / 1e6).toFixed(2)), // Convert USDT amount to 2 decimals
            timestamp,
            asset: tx.tokenInfo?.symbol || "USDT", // Default to USDT if missing
            network: tx.tokenInfo?.name,
          });
        } catch (err) {
          console.error(
            `Error fetching timestamp for txID: ${txID}`,
            err.message
          );
        }
      }

      // Convert the map back to an array
      const mergedTransactions = Array.from(transactionMap.values());

      // Filter transactions in the last 60 seconds
      const newTransactions = mergedTransactions.filter(
        (tx) => tx.timestamp >= oneMinuteAgo
      );

      for (const tx of newTransactions) {
        const transactionType =
          tx.to === wallet.wallet ? "Deposit" : "Withdrawal";

        // Fetch user details from UserModel
        const user = await UserModel.findById(wallet.userId);
        let fee = (tx.amount * 0.4) / 100; // Calculate 0.4% fee
        let remainingAmount = tx.amount - fee;

        // Store transaction in the database
        const mainTransaction = new TransactionModel({
          name: user.name,
          email: user.email,
          userID: wallet.userId,
          amount: remainingAmount,
          paymentMethod: "Crypto",
          asset: tx.asset,
          network: tx.network,
          closingBalance: 0,
          type: transactionType,
          status: 1,
        });

        await mainTransaction.save();

        const walletDetails = new WalletTransactionModel({
          transactionId: mainTransaction._id,
          fromWallet: tx.from,
          toWallet: tx.to || undefined,
          hash: tx.txID,
          fee,
          symbol: tx.asset,
          network: tx.network,
        });

        await walletDetails.save();
        await sendTransactionEmail(user.email, user.name, mainTransaction);
        console.log(`Transaction ${tx.txID} stored successfully!`);
      }

      if (newTransactions.length === 0) {
        console.log(
          `No new transactions in the last 60 seconds for ${wallet.wallet}`
        );
      }
    }
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
  }
};

// Run every 1 minute
// setInterval(getWalletTransactions, 60000);
// getWalletTransactions();

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
            }  ${mainTransaction.asset}  has been credited to your account.</p>
            <p style="color: #333; font-size: 17px; margin-bottom: 5px;">Below are the transaction details:</p>
             
            <ul style="list-style-type: none; padding: 0; color: #333; font-size: 16px;">
                <li>Amount: ${mainTransaction.amount}</li>
                ${
                  mainTransaction.asset
                    ? `<li>Asset: ${mainTransaction.asset}</li>`
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
  getWalletTransactions,
  addWalletController,
  getAllWalletsController,
  getSingleWalletController,
  changeCurrencyController,
  getCurrencyController,
};
