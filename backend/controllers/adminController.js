const {
  hashPassword,
  comparePassword,
  generateTokenAndSetCookie,
  getFormattedDateTime,
} = require("../helpers/authHelper");
const adminModel = require("../models/adminModel");
const crypto = require("crypto");
const createTransporter = require("../config/emailConfig");
//Register
const registerNewAdminController = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!username) {
      return res.send({ message: "Username is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }

    // Check if the user already exists
    const existingUser = await adminModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Email Already Registered !",
      });
    }
    const existingUsername = await adminModel.findOne({ username });
    if (existingUsername) {
      return res.status(409).send({
        success: false,
        message: "Username Already Registered !",
      });
    }
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new user
    const subAdmin = await new adminModel({
      name,
      username,
      email,
      password: hashedPassword,
    }).save();

    res.status(201).send({
      success: true,
      message: "Admin Created  Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};
//get all sub-admins
const getAllSubAdminController = async (req, res) => {
  try {
    const admins = await adminModel
      .find({
        role: "sub-admin",
      })
      .select("-password");

    if (!admins || admins.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No admins found" });
    }
    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.log("Error in getting admins: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const loginAdminController = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username) {
      return res
        .status(400)
        .send({ success: false, message: "Username is Required" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ success: false, message: "Password is Required" });
    }

    // Find admin by username or email
    const subAdmin = await adminModel.findOne({ username });
    if (!subAdmin) {
      return res.status(400).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, subAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate verification token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update admin details
    subAdmin.verificationToken = verificationToken;
    subAdmin.verificationTokenExpiresAt = verificationTokenExpiresAt;
    subAdmin.lastLogin = new Date();
    await subAdmin.save();

    // Fetch all admins from the database
    const allAdmins = await adminModel.find({});

    // Send OTP via email to all admins
    for (const admin of allAdmins) {
      await sendLoginOtp(admin.email, subAdmin.name, verificationToken);
    }

    // Response
    res.status(200).send({
      success: true,
      message: "Please enter verification code!",
    });
  } catch (error) {
    console.error("Error in loginAdminController:", error);
    res.status(500).send({
      success: false,
      message: "Error during login. Please try again later.",
    });
  }
};

const verifyAdminLoginController = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).send({ success: false, message: "OTP is Required" });
  }
  try {
    // Check if the user already exists
    const subAdmin = await adminModel
      .findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      })
      .select("-password"); // Exclude the password field

    if (!subAdmin) {
      return res.status(200).send({
        success: false,
        message: "Invalid or expired verification code !!",
      });
    }

    subAdmin.verificationToken = undefined;
    subAdmin.verificationTokenExpiresAt = undefined;
    await subAdmin.save();
    const { date, time } = getFormattedDateTime();
    const token = await generateTokenAndSetCookie(res, subAdmin._id);
    const allAdmins = await adminModel.find({});
    // Send OTP via email to all admins
    for (const admin of allAdmins) {
      await sendLoginEmail(admin.email, subAdmin.name, time, date);
    }

    // Send OTP via email
    res.status(201).send({
      success: true,
      message: "Logged in SuccessFully !",
      subAdmin,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Verification Code",
      error,
    });
  }
};
//login otp again

const LoginAdminOtpAgainController = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).send({ message: "username is Required" });
    }

    // check username and answer
    const subAdmin = await adminModel.findOne({ username });
    //validation
    if (!subAdmin) {
      return res.status(404).send({
        success: false,
        message: "Username Not Found",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // Generate OTP and timeotp
    const vte = Date.now() + 10 * 60 * 1000;
    (subAdmin.verificationToken = verificationToken),
      (subAdmin.verificationTokenExpiresAt = vte);
    await subAdmin.save();

    // Send OTP via email
    const allAdmins = await adminModel.find({});

    // Send OTP via email to all admins
    for (const admin of allAdmins) {
      await sendLoginOtp(admin.email, subAdmin.name, verificationToken);
    }

    res.status(201).send({
      success: true,
      message: `OTP Sent again`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Sending OTP",
      error,
    });
  }
};
//delete admin

const deleteAdminController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is provided
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Check if the admin exists
    const admin = await adminModel.findById(id);
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // Delete the admin
    await adminModel.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Admin Deleted Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Admin API",
      error: error.message, // Send only the error message for security
    });
  }
};
//edit controller
const updateAdminController = async (req, res) => {
  try {
    const { name, username, email, password, access } = req.body;
    const { adminId } = req.params; // Get admin ID from URL params

    // Check if the admin exists
    const existingAdmin = await adminModel.findById(adminId);
    if (!existingAdmin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if the new email is already taken by another user
    if (email && email !== existingAdmin.email) {
      const emailExists = await adminModel.findOne({ email });
      if (emailExists) {
        return res.status(409).send({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Check if the new username is already taken by another user
    if (username && username !== existingAdmin.username) {
      const usernameExists = await adminModel.findOne({ username });
      if (usernameExists) {
        return res.status(409).send({
          success: false,
          message: "Username already registered",
        });
      }
    }

    // Prepare update object
    const updateData = {
      name: name || existingAdmin.name,
      username: username || existingAdmin.username,
      email: email || existingAdmin.email,
      access: {
        users: access?.users || existingAdmin.access.users,
        kyc: access?.kyc || existingAdmin.access.kyc,
        transactions: access?.transactions || existingAdmin.access.transactions,
        deposit: access?.deposit || existingAdmin.access.deposit,
        withdrawals: access?.withdrawals || existingAdmin.access.withdrawals,
        adminWallets: access?.adminWallets || existingAdmin.access.adminWallets,
        bank: access?.bank || existingAdmin.access.bank,
        wallets: access?.wallets || existingAdmin.access.wallets,
        baseCurrency: access?.baseCurrency || existingAdmin.access.baseCurrency,
      },
    };

    // If password is provided, hash it before updating
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    // Update the admin in the database
    await adminModel.findByIdAndUpdate(adminId, updateData, { new: true });

    res.status(200).send({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).send({
      success: false,
      message: "Error updating admin",
      error,
    });
  }
};

const sendLoginEmail = async (email, name, time, date) => {
  try {
    // Configure the email transport using nodemailer

    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL_P,
      to: email,
      subject: "PQS Alert",
      html: `<div style="background: #0E2340; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">PQS</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h5 style="font-size:20px">Dear  ${name},</h5>
                <p style="font-size:17px">You have  successfully logged in to PQS  at <strong>${time}</strong> on <strong>${date}</strong>.</p>
                <p style="font-size:17px">If you do not recognize this login attempt, please immediately Login to our Website  </strong> to block the  services.</p>
                <p style="font-size:17px">Please note that PQS will never ask for any confidential information by calling from any number including its official helpline numbers, through emails or websites! Please do not share your confidential details such as  CVV, User Name, Password, OTP etc.</p>
                <p>In case of any complaint, you may contact us through:</p>
                <ul>
                    <li style="font-size:17px">Email: <a href="mailto:support@pqs.com">support@pqs.com</a></li>
                    <li style="font-size:17px">Phone: <a href="tel:+442071775747">+44 2071775747</a></li>
                    <li style="font-size:17px">Websites: <a href="https://www.pqs.fund/contact/">www.pqs.fund/complaint-form/</a></li>
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

const forgotPasswordController = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    // Check if the admin exists
    const subAdmin = await adminModel.findOne({ username });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: "Username not found.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = Date.now() + 3600000; // 1 hour validity

    // Update admin record
    subAdmin.resetPasswordToken = resetToken;
    subAdmin.resetPasswordExpiresAt = resetTokenExpiresAt;
    await subAdmin.save();

    // Get all admins
    const allAdmins = await adminModel.find({}, "email"); // Fetch only emails

    // Send email to all admins (async for better performance)
    await Promise.all(
      allAdmins.map((admin) =>
        forgotPasswordEmail(
          admin.email,
          subAdmin.name,
          `${process.env.CLIENT_URL_ADMIN}/reset-password-admin/${resetToken}`
        )
      )
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to admin emails.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending the reset password link.",
    });
  }
};

//reset password controller
const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    // check email and answer
    const subAdmin = await adminModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    //validation
    if (!subAdmin) {
      return res.status(400).send({
        success: false,
        message: "Invalid Token or Reset Link Expired !!",
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    subAdmin.password = hashedPassword;
    subAdmin.resetPasswordToken = undefined;
    subAdmin.resetPasswordExpiresAt = undefined;
    await subAdmin.save();
    const { date, time } = getFormattedDateTime();

    // Get all admins
    const allAdmins = await adminModel.find({}, "email"); // Fetch only emails

    // Send email to all admins (async for better performance)
    await Promise.all(
      allAdmins.map((admin) =>
        resetPasswordEmail(admin.email, subAdmin.name, time, date)
      )
    );
    return res.status(200).send({
      success: true,
      message: "Password Changed Successfully !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in changing password ",
      error,
    });
  }
};

// emails
const sendLoginOtp = async (email, name, verificationToken) => {
  // Configure the email transport using nodemailer
  const transporter = createTransporter();

  // Email options
  const mailOptions = {
    from: process.env.AUTH_EMAIL_P,
    to: email,
    subject: "Login otp to PQS",
    html: `<div style="background: #0E2340 ; text-align: center;">
       <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px; " >PQS</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 17px; margin-bottom: 5px;">Dear  <span>${name},</span> </p> 
         
      <p style="color: #333; font-size: 17px; margin-bottom: 5px;"> This is code to verify and login </p>
         <div style="color: #0E2340;  display: inline-block; padding: 10px 20px; border-radius: 4px; font-size: 35px; letter-spacing: 1.5px;">
                  <strong>${verificationToken}</strong>
              </div>
       <p style="color: #333; font-size: 17px; margin-bottom: 5px;"> This OTP is valid for 10 minutes.</p>
      <h5 style="color: #333; font-size: 17px; margin-bottom: 5px;">Best regards,<br>PQS Team</h5>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
      <h6>This is an automated message, please do not reply to this email.</h6>
    </div>`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

const forgotPasswordEmail = async (email, name, resetToken) => {
  // Configure the email transport using nodemailer
  const transporter = createTransporter();

  // Email options
  const mailOptions = {
    from: process.env.AUTH_EMAIL_P,
    to: email,
    subject: "Forgot Password",
    html: `<div style="background: #0E2340; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">PQS</h1>
</div>
<div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <h5 style="font-size:20px">Dear  ${name}, </h5>
    <p style="font-size:17px">PQS recently received a request for a forgotten password.</p>
    <p style="font-size:17px">To change your PQS password, please click on below link</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${resetToken}" style="font-size: 20px; font-weight: bold; background: #0E2340; color: #fff; padding: 10px 30px; border-radius: 5px; text-decoration: none;">Reset your password</a>
    </div>
     
    <p style="font-size:17px">The Link will expire in 1 hour for security reasons.</p>
    <p style="font-size:17px">If you did not request this change, you do not need to do anything.</p>
    <h5 style="font-size:17px">Best regards,<br>PQS Team</h5>
     
</div>
<div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <p>This is an automated message, please do not reply to this email.</p>
</div>
`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
const resetPasswordEmail = async (email, name, time, date) => {
  // Configure the email transport using nodemailer
  const transporter = createTransporter();

  // Email options
  const mailOptions = {
    from: process.env.AUTH_EMAIL_P,
    to: email,
    subject: "Reset Password",
    html: `<div style="background: #0E2340; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">PQS</h1>
</div>
<div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <h5 style="font-size:20px">Dear ${name}, </h5>
    <p style="font-size:17px">You have successfully changed  your password  at <strong>${time}</strong> on <strong>${date}</strong>.</p>
    <p style="font-size:17px">If you do not recognize this  attempt, please immediately  contact us to block the  services.</p>
    <p style="font-size:17px">Please note that PQS will never ask for any confidential information by calling from any number including its official helpline numbers, through emails or websites! Please do not share your confidential details such as  CVV, User Name, Password, OTP etc.</p>
    <p>In case of any complaint, you may contact us through:</p>
     <ul>
                    <li style="font-size:17px">Email: <a href="mailto:support@pqs.com">support@pqs.com</a></li>
                    <li style="font-size:17px">Phone: <a href="tel:+442071775747">+44 2071775747</a></li>
                    <li style="font-size:17px">Websites: <a href="https://www.pqs.fund/contact/">www.pqs.fund/complaint-form/</a></li>
                </ul>
</div>
<div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <p>This is an automated message, please do not reply to this email.</p>
</div>
`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
module.exports = {
  registerNewAdminController,
  loginAdminController,
  verifyAdminLoginController,
  LoginAdminOtpAgainController,
  getAllSubAdminController,
  deleteAdminController,
  updateAdminController,
  forgotPasswordController,
  resetPasswordController,
};
