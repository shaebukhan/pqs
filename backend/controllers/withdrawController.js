const WithdrawalModel = require("../models/WithdrawalModel");
const UserModel = require("../models/UserModel");
const TransactionModel = require("../models/TransactionModel");
const createTransporter = require("../config/emailConfig");
const WalletTransactionModel = require("../models/WalletTransactionModel");


// new withdraw request
const newWithdrawController = async (req, res) => {
    const { id, email, name, account, asset, network, classa, amount, walletAddress } = req.body;


    // Input Validation 
    // Input Validation 
    if (account === 'wallet') {
        if (!id || !email || !name || !account || !amount || !walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'All required fields (id, email, name, account, amount, walletAddress) must be provided for wallet.',
            });
        }
    } else if (account === 'pqsfund') {
        if (!id || !email || !name || !account || !amount || !classa) {
            return res.status(400).json({
                success: false,
                message: 'All required fields (id, email, name, account, amount, classa) must be provided for pqsfund.',
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            message: 'Invalid account type. Please provide a valid account type.',
        });
    }


    try {
        // Find the user by ID
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Create and save the withdrawal request
        const newWithdraw = new WithdrawalModel({
            userId: id,
            email,
            name,
            account,
            asset,
            network,
            class: classa,
            walletAddress,
            amount,
            status: "pending",
        });
        await newWithdraw.save();
        withdrawProcessingEmail(user.email, user.name);
        return res.status(201).json({
            success: true,
            message: 'Redemption Request Sent Successfully!',
        });
    } catch (error) {
        console.error('Redemption Request Failed', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};

// get all withdraws 
const getAllWithdrawsController = async (req, res) => {
    try {
        // Fetch all withdrawal requests
        const withdrawRequests = await WithdrawalModel.find();

        // Check if any withdrawal requests exist
        if (withdrawRequests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Redemptions requests found.',
            });
        }

        // Send the list of withdrawal requests
        return res.status(200).json({
            success: true,
            message: 'Redemption requests retrieved successfully.',
            withdrawRequests,
        });
    } catch (error) {
        console.error('Error retrieving Redemption requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};
// single withdraw 
const getSingleWithdrawController = async (req, res) => {
    const { id } = req.params;

    try {
        // Validate the request parameter
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Redemption ID is required.',
            });
        }

        // Fetch the specific withdrawal request by ID
        const withdrawRequest = await WithdrawalModel.findById(id);

        // Check if the withdrawal request exists
        if (!withdrawRequest) {
            return res.status(404).json({
                success: false,
                message: 'Redemption request not found.',
            });
        }

        // Send the withdrawal request details
        return res.status(200).json({
            success: true,
            message: 'Redemption request retrieved successfully.',
            withdrawRequest,
        });
    } catch (error) {
        console.error('Error retrieving Redemption request:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};

//wallet details from transaction id 
const getTransactionWalletsController = async (req, res) => {
    const { id } = req.params; // id is the transactionId passed in the request URL

    try {
        // Validate the request parameter
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required.',
            });
        }

        // Fetch wallets associated with the transactionId
        const wallets = await WalletTransactionModel.find({ transactionId: id });

        // Check if any wallets were found
        if (wallets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No wallets found for the given transaction ID.',
            });
        }

        // Return the wallets
        return res.status(200).json({
            success: true,
            wallets,
        });

    } catch (error) {
        console.error('Error fetching transaction wallets:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};

//update withdrawal request 

const updateWithdrawController = async (req, res) => {
    const { id } = req.params;
    const { status, toWallet, fromWallet, notes, rejectReason } = req.body;
    try {
        // Validate the request parameter
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal ID is required.',
            });
        }

        // Fetch the specific withdrawal request by ID
        const withdrawRequest = await WithdrawalModel.findById(id);

        // Check if the withdrawal request exists
        if (!withdrawRequest) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found.',
            });
        }

        // Extract relevant data from the withdrawal request
        const { userId, asset, network, amount } = withdrawRequest;

        // Fetch the user and their balances
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (status === "rejected") {
            withdrawRequest.status = status;
            await withdrawRequest.save();
            await withdrawRejectEmail(user.email, user.name, rejectReason);

            return res.status(200).send({
                success: true,
                message: "Withdrawal Request Rejected",
            });
        }

        // Access the user's crypto balances
        const cryptoBalances = user.balances.crypto;

        // Find the matching asset and network in the user's balances
        const matchingAsset = cryptoBalances.find((crypto) => crypto.asset === asset);

        if (!matchingAsset) {
            return res.status(400).json({
                success: false,
                message: `Asset ${asset} not found in user's balances.`,
            });
        }

        const matchingNetwork = matchingAsset.networks.find(
            (net) => net.networkName === network
        );

        if (!matchingNetwork) {
            return res.status(400).json({
                success: false,
                message: `Network ${network} not found for asset ${asset} in user's balances.`,
            });
        }

        // Check if the user has sufficient balance
        if (matchingNetwork.availableBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance for this withdrawal request.',
            });
        }

        const closingBalance = matchingNetwork.availableBalance -= amount;

        await user.save();
        withdrawRequest.status = status;
        await withdrawRequest.save();

        const mainTransaction = new TransactionModel({
            name: withdrawRequest.name,
            email: withdrawRequest.email,
            userID: withdrawRequest.userId,
            amount: withdrawRequest.amount,
            paymentMethod: "Crypto",
            currency: undefined,
            asset: withdrawRequest.asset,
            network: withdrawRequest.network,
            closingBalance,
            type: "Withdrawal",
            status: 1,
        });
        await mainTransaction.save();

        const walletDetails = new WalletTransactionModel({
            transactionId: mainTransaction._id,
            fromWallet,
            toWallet,
            notes
        });
        await walletDetails.save();


        try {
            await sendTransactionEmail(user.email, user.name, mainTransaction);
        } catch (emailError) {
            console.error('Error sending transaction email:', emailError.message);
        }


        return res.status(200).json({
            success: true,
            message: 'Withdrawal processed successfully.',
            updatedBalance: matchingNetwork.availableBalance,
        });

    } catch (error) {
        console.error('Error processing withdrawal request:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};


const withdrawProcessingEmail = async (email, name) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();


    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P,
        to: email,
        subject: 'PQS Redemption Request',
        html: `<div style="background: #0E2340; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">PQS</h1>
</div>
<div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <h5 style="font-size:18px">Dear  ${name}, </h5>
    <p style="font-size:16px">  We have received your redemption request and are processing it .
Our team will be in touch with you within  a very short delay.
Please feel free to contact us if you have any questions. </p>
<ul>
                    <li style="font-size:17px">Email: <a href="mailto:support@pqs.com">support@pqs.com</a></li>
                    <li style="font-size:17px">Phone: <a href="tel:+442071775747">+44 2071775747</a></li>
                    <li style="font-size:17px">Websites: <a href="https://www.pqs.fund/contact/">www.pqs.fund/complaint-form/</a></li>
                </ul>
  <h5 style="color: #333; font-size: 17px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>   
</div>
<div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <p>This is an automated message, please do not reply to this email.</p>
</div>
`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};


const withdrawRejectEmail = async (email, name, rejectReason) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();


    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P,
        to: email,
        subject: 'PQS Redemption Request',
        html: `<div style="background: #0E2340; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">PQS</h1>
</div>
<div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <h5 style="font-size:18px">Dear  ${name}, </h5>
    <p style="font-size:16px">  We have received your redemption request   but unfortunately! your  redemption request was rejected due to following reason : </p> 
    <p style="font-size:16px">${rejectReason} </p>
    <h5 style="color: #333; font-size: 17px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>  
</div>
<div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <p>This is an automated message, please do not reply to this email.</p>
</div>
`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

const sendTransactionEmail = async (email, name, mainTransaction) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P,
        to: email,
        subject: 'Debit Transaction Alert',
        html: `
        <div style="background: #0E2340; text-align: center;">
            <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px;">PQS</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Dear <span >${name}</span>,</h5>
            <p style="color: #333; font-size: 16px; margin-bottom: 5px;"> your  redemption request of ${mainTransaction.amount}  ${mainTransaction.currency || mainTransaction.asset} has been completed.</p>
            <p style="color: #333; font-size: 16px; margin-bottom: 5px;">Below are the transaction details:</p>
             
            <ul style="list-style-type: none; padding: 0; color: #333;">
                <li>Amount: ${mainTransaction.amount}</li>
                ${mainTransaction.currency ? `<li>Currency: ${mainTransaction.currency}</li>` : ''}
                ${mainTransaction.asset ? `<li>Asset: ${mainTransaction.asset}</li>` : ''}
                ${mainTransaction.network ? `<li>Network: ${mainTransaction.network}</li>` : ''}
                <li>Payment Method: ${mainTransaction.paymentMethod}</li>
                <li>Date: ${new Date(mainTransaction.date).toLocaleString()}</li>
            </ul>
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
            <h6>This is an automated message, please do not reply to this email.</h6>
        </div>`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};


module.exports = { newWithdrawController, getAllWithdrawsController, getSingleWithdrawController, updateWithdrawController, getTransactionWalletsController };
