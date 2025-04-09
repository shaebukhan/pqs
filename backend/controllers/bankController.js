const BankModel = require("../models/BankModel");
const UserModel = require("../models/UserModel");
const createTransporter = require("../config/emailConfig");

//add bank 

const addBankController = async (req, res) => {

    try {
        const { userId, accountNumber, sortCode, bankName, bankAddress, iban, swiftCode } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(200).json({ success: false, message: 'User not found.' });
        }
        const existingBank = await BankModel.findOne({ accountNumber });
        if (existingBank) {
            return res.status(200).send({
                success: false,
                message: "Account Already  in Use !"
            });
        }
        // Validate data and save it to the database
        const newAccount = await new BankModel({
            userId,
            accountNumber,
            sortCode,
            bankName,
            bankAddress,
            iban,
            swiftCode,
        });
        await sendAddBankEmail(user.email, user.name, accountNumber);
        await newAccount.save();
        res.status(201).send({ success: true, message: 'Bank account added successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

// get accounts by user id  

const getAllBanksController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(200).json({ success: false, message: 'User not found.' });
        }

        const banks = await BankModel.find({ userId }).select("bankName _id");
        if (!banks || banks.length === 0) {
            return res.status(201).send({ success: false, message: "No banks found" });
        }
        return res.status(200).send({
            success: true,
            banks
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getSingleBankController = async (req, res) => {
    try {
        const { id } = req.params;
        const bank = await BankModel.findById(id);
        if (!bank) {
            return res.status(201).json({ success: false, message: "No data found" });
        }
        return res.status(200).send({
            success: true,
            bank
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const sendAddBankEmail = async (email, name, accountNumber) => {
    try {
        // Configure the email transport using nodemailer

        const transporter = createTransporter();



        // Email options
        const mailOptions = {
            from: process.env.AUTH_EMAIL_P,
            to: email,
            subject: 'Beneficiary Management',
            html: `<div style="background: #0E2340; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">PQS</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h5 style="color: #333; font-size: 15px; margin-bottom: 5px;">Dear <span style="text-transform:uppercase;">${name}</span>,</h5>
                <h5 style="color: #333; font-size: 15px; margin-bottom: 5px;">Beneficiary Added successfully.</h5>
    <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Beneficiary Details</h5>  
      
<div style="display: flex; justify-content: space-between;margin-top:10px;">
    <span style="font-size: 17px; width: 50%;">Account No</span>
    <span style="font-size: 17px; width: 50%;">${accountNumber}</span>
</div>
               
                <p style="font-size:17px">If you do not recognize this login attempt, please immediately Login to our Website    to block the  services.</p>
                <p style="font-size:17px">Please note that PQS will never ask for any confidential information by calling from any number including its official helpline numbers, through emails or websites! Please do not share your confidential details such as  CVV, User Name, Password, OTP etc.</p>
                <p>In case of any complaint, you may contact us through:</p>
                <ul>
                    <li style="font-size:17px">Email: <a href="mailto:support@pqs.com">support@pqs.com</a></li>
                    <li style="font-size:17px">Phone: <a href="tel:+442071675747">+44 2071675747</a></li>
                    <li style="font-size:17px">Websites: <a href="https://www.pqs.com/contact/">www.pqs.com/complaint-form/</a></li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
                <p>This is an automated message, please do not reply to this email.</p>
            </div>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error occurred:', error.message);
            }
            console.log('Message sent: %s', info.messageId);
        });
    } catch (error) {
        console.error('Error sending email:', error); // Log the error
        throw new Error('Failed to send email'); // Optional: Throw an error to propagate it further
    }
};

module.exports = { addBankController, getAllBanksController, getSingleBankController };