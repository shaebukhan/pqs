
const createTransporter = require("../config/emailConfig");


const contactFormController = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name) {
            return res.status(400).send({ message: "Name is required" });
        }
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }
        if (!subject) {
            return res.status(400).send({ message: "Subject is required" });
        }
        if (!message) {
            return res.status(400).send({ message: "Message is required" });
        }

        // Send email to admin
        await sendComplaintEmailAdmin(subject, name, email, message);
        await sendComplaintEmailUser(email, name);

        res.status(201).send({
            success: true,
            message: "Complaint submitted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in submitting complaint",
            error: error.message,
        });
    }
};


const sendComplaintEmailAdmin = async (subject, name, email, message) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();


    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P,
        to: process.env.AUTH_EMAIL_P,
        subject: subject,
        html: `<div style="background: #0E2340 ; text-align: center;">
     <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px; " >PQS</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #333; font-size: 17px; margin-bottom: 5px;">Dear Admin,  </p> 
       
     <p style="color: #333; font-size: 16px; margin-bottom: 5px;">A new complaint has been submitted with the following details:</p>
                <p><strong>Name : </strong> ${name}</p>
                <p><strong>Email : </strong> ${email}</p>
                <p><strong>Subject : </strong> ${subject}</p>
                <p><strong>Message : </strong> ${message}</p>
                <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <h6>This is an automated message, please do not reply to this email.</h6>
  </div>`
    };


    // Send the email
    await transporter.sendMail(mailOptions);
};

const sendComplaintEmailUser = async (email, name) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();


    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P,
        to: email,
        subject: 'Complaint Submission',
        html: `<div style="background: #0E2340 ; text-align: center;">
     <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px; " >PQS</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #333; font-size: 17px; margin-bottom: 5px;">Dear   ${name}, </p> 
       
    
     <p style="color: #333; font-size: 17px; margin-bottom: 5px;"> We have received your Complaint , we will Shortly Contact with you and make improvements in it . Thanks</p>
    <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <h6>This is an automated message, please do not reply to this email.</h6>
  </div>`
    };


    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = { contactFormController };