const {
  hashPassword,
  comparePassword,
  generateTokenAndSetCookie,
  getFormattedDateTime,
  generateRandomString,
} = require("../helpers/authHelper");
const UserModel = require("../models/UserModel");
const crypto = require("crypto");
const createTransporter = require("../config/emailConfig");

//Register
const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Email Already Registered !! Please Login",
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // Generate OTP and timeotp

    // Create the new user
    const user = await new UserModel({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000,
    }).save();
    const token = await generateTokenAndSetCookie(res, user._id);
    // console.log(token);

    // Send OTP via email
    await sendOtpEmail(email, name, verificationToken);
    const protect = generateRandomString(20);
    res.status(201).send({
      success: true,
      message:
        "Account Created  Successfully. Please check your email for the OTP.",
      user,
      token,
      protect,
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
//again otp
const otpSendController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is Required" });
    }

    // check email and answer
    const user = await UserModel.findOne({ email });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email Not Found",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // Generate OTP and timeotp
    const vte = Date.now() + 10 * 60 * 1000;
    (user.verificationToken = verificationToken),
      (user.verificationTokenExpiresAt = vte);
    await user.save();
    // Send OTP via email
    await sendOtpEmail(email, user.name, verificationToken);

    res.status(201).send({
      success: true,
      message: `OTP Send again to ${user.email} . Please check your email for the OTP.`,
      user,
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
//change email controller
const changeEmailController = async (req, res) => {
  try {
    const { email, oldemail } = req.body;

    // Check if both old and new email are provided
    if (!email || !oldemail) {
      return res.status(400).send({ message: "email is required." });
    }
    if (email === oldemail) {
      return res.status(200).send({
        success: false,
        message: "New Email and Old email Can not be same",
      });
    }

    const alreadyEmail = await UserModel.findOne({ email });
    if (alreadyEmail) {
      return res.status(200).send({
        success: false,
        message: "Email Already Registered",
      });
    }
    // Find user by the old email
    const user = await UserModel.findOne({ email: oldemail });

    // Validation: Check if user exists
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    // Generate OTP and its expiration time
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Update user's email to new email
    user.email = email;
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;

    // Save the updated user information
    await user.save();

    // Send OTP via email to the new email address
    await sendOtpEmail(email, user.name, verificationToken);

    // Respond with success message
    res.status(200).send({
      success: true,
      message: `OTP sent to new Email ${email}. Please check your new email for verification.`,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in updating email and sending OTP.",
      error,
    });
  }
};

//Verify Email
const verifyEmailController = async (req, res) => {
  const { code } = req.body;
  try {
    // Check if the user already exists
    const user = await UserModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Invalid or expired verification code !!",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);
    const token = await generateTokenAndSetCookie(res, user._id);
    // Send OTP via email
    res.status(201).send({
      success: true,
      message: "Email verified successfully.",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Verification Email",
      error,
    });
  }
};
// LOGIN
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).send({
        success: false,
        message: "Invalid Email!! or Password",
      });
    }
    //check user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Email not Found!",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isVerified = await user.isVerified;
    if (!isVerified) {
      const protect = generateRandomString(20);
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000;
      const condition = 204;
      user.verificationToken = verificationToken;
      user.verificationTokenExpiresAt = verificationTokenExpiresAt;

      // Save the updated user information
      await user.save();
      await sendOtpEmail(user.email, user.name, verificationToken);

      return res.status(201).send({
        success: false,
        message: "Email not verified.",
        protect,
        condition,
        email: user.email,
      });
    }
    const status = await user.status;
    if (status === 1) {
      return res.status(201).send({
        success: false,
        message: "Account Locked Please Contact Admin",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const vte = Date.now() + 10 * 60 * 1000;
    (user.verificationToken = verificationToken),
      (user.verificationTokenExpiresAt = vte);
    const protect = generateRandomString(20);
    user.lastLogin = new Date();
    await user.save();
    // Send OTP via email
    await sendOtpLoginEmail(email, user.name, verificationToken);
    res.status(200).send({
      success: true,
      message: "Please enter verification code !",
      user,
      protect,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};
//

const verifyLoginController = async (req, res) => {
  const { code } = req.body;
  try {
    // Check if the user already exists
    const user = await UserModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Invalid or expired verification code !!",
      });
    }

    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    const { date, time } = getFormattedDateTime();
    await sendLoginEmail(user.email, user.name, time, date);
    const token = await generateTokenAndSetCookie(res, user._id);
    // Send OTP via email
    res.status(201).send({
      success: true,
      message: "Logged in SuccessFully !",
      user,
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

const LoginOtpAgainController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is Required" });
    }

    // check email and answer
    const user = await UserModel.findOne({ email });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email Not Found",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // Generate OTP and timeotp
    const vte = Date.now() + 10 * 60 * 1000;
    (user.verificationToken = verificationToken),
      (user.verificationTokenExpiresAt = vte);
    await user.save();
    // Send OTP via email
    await sendOtpLoginEmail(email, user.name, verificationToken);

    res.status(201).send({
      success: true,
      message: `OTP Send again to ${user.email} . Please check your email for the OTP.`,
      user,
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

//logout
const logoutController = async (req, res) => {
  res.clearCookie("token");
  res.status(201).send({
    success: true,
    message: "Logged out successfully!",
  });
};
//forgot password Controller

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(200).send({
        success: false,
        message: "Email is Required",
      });
    }

    // check email and answer
    const user = await UserModel.findOne({ email });
    //validation
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Email Not Found",
      });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();
    await forgotPasswordEmail(
      user.email,
      user.name,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return res.status(200).send({
      success: true,
      message: "Password reset link sent to your email !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in sending rest password link",
      error,
    });
  }
};
//reset password controller
const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    // check email and answer
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    //validation
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Invalid Token or Reset Link Expired !!",
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    const { date, time } = getFormattedDateTime();
    await resetPasswordEmail(user.email, user.name, time, date);

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
//check auth

const checkAuth = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAlluserController = async (req, res) => {
  try {
    // Find all users with role == 0 and exclude the password field
    const users = await UserModel.find({ role: 0 }).select("-password");

    if (!users || users.length === 0) {
      return res
        .status(204)
        .json({ success: false, message: "No users found" });
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error in getting users: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllVerifiedUserController = async (req, res) => {
  try {
    // Find all users with role == 0 and exclude the password field
    const users = await UserModel.find({
      role: 0,
      kycstatus: 2,
      status: 0,
      isVerified: true,
    }).select("-password");

    if (!users || users.length === 0) {
      return res
        .status(204)
        .json({ success: false, message: "No users found" });
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error in getting users: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const UserProfileUpdateController = async (req, res) => {
  try {
    // Destructure input data from the request body
    const { id } = req.params;

    const {
      email,
      firstName,
      lastName,
      phone,
      gender,
      postal,
      address,
      street,
      city,
      state,
      dob,
      country,
      designation,
      identityType,
    } = req.body;

    // Find the user by ID
    const user = await UserModel.findById(id);

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" }); // Use 404 for not found
    }

    // Update email if provided
    user.email = email || user.email;

    // Assume you want to update the first object in the profile.details array
    const index = 0;

    if (user.profile.details[index]) {
      // Update the fields of the specific details object
      user.profile.details[index] = {
        ...user.profile.details[index], // Keep existing properties
        identityType: identityType || user.profile.details[index].identityType,
        firstName: firstName || user.profile.details[index].firstName,
        lastName: lastName || user.profile.details[index].lastName,
        phone: phone || user.profile.details[index].phone,
        dob: dob || user.profile.details[index].dob,
        gender: gender || user.profile.details[index].gender,
        postal: postal || user.profile.details[index].postal,
        address: address || user.profile.details[index].address,
        street: street || user.profile.details[index].street,
        city: city || user.profile.details[index].city,
        state: state || user.profile.details[index].state,
        country: country || user.profile.details[index].country,
        designation: designation || user.profile.details[index].designation,
      };
    } else {
      // If the index does not exist, you may want to add a new object (optional logic)
      user.profile.details[index] = {
        identityType: identityType || "",
        firstName: firstName || "",
        lastName: lastName || "",
        phone: phone || "",
        dob: dob || null,
        gender: gender || "",
        postal: postal || "",
        address: address || "",
        street: street || "",
        city: city || "",
        state: state || "",
        country: country || "",
        designation: designation || "",
      };
    }

    // Save the updated user data
    await user.save();

    // Respond with success
    res.json({
      success: true,
      message: "Profile updated successfully",
      details: user.profile.details[0],
      email: user.email,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const profileUpdateController = async (req, res) => {
  try {
    const { id } = req.params; // Extract the user ID from the route parameter
    const { name, email, password } = req.body; // Extract fields from request body

    // Find the user by ID
    const user = await UserModel.findById(id);

    if (!user) {
      return res
        .status(204)
        .json({ success: false, message: "Account not found" });
    }

    // If password is provided, hash and update it
    if (password) {
      const hashedPassword = await hashPassword(password);

      user.password = hashedPassword;
    }

    // Save the updated user data
    await user.save();

    // Respond with success
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//add account by admin

const addUserAdminController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Email Already Registered !!",
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new user
    const user = await new UserModel({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Added  Successfully !",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Adding user",
      error,
    });
  }
};

//get single user

const getSingleUserController = async (req, res) => {
  try {
    const { id } = req.params; // Extract the user ID from the route parameter

    // Find the user by ID
    const user = await UserModel.findById(id);

    if (!user) {
      return res
        .status(204)
        .json({ success: false, message: "Account not found" });
    }

    // Respond with success
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
//user  profile
const getUserDataController = async (req, res) => {
  try {
    const { id } = req.params; // Extract the user ID from the route parameter

    // Find the user by ID
    const user = await UserModel.findById(id);

    if (!user) {
      return res
        .status(201)
        .json({ success: false, message: "Account not found" });
    }

    // Respond with success
    res.json({
      success: true,
      details: user.profile.details[0],
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
//update user

const userUpdateController = async (req, res) => {
  try {
    const { id } = req.params; // Extract the user ID from the route parameter
    const { name, email, password, status } = req.body; // Extract fields from request body

    // Validate required fields
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required." });
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }

    // Validate status if provided
    if (status !== undefined) {
      if (![0, 1].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value. Must be 0 (Active) or 1 (Locked).",
        });
      }
    }

    // Find the user by ID
    const user = await UserModel.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });
    }

    // Update name and email
    user.name = name;
    user.email = email;

    // If password is provided, hash and update it
    if (password) {
      // Assuming hashPassword is a function that hashes the password
      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword;
    }

    // If status is provided, update it
    if (status !== undefined) {
      user.status = status;
    }

    // Save the updated user data
    await user.save();

    // Respond with success and the updated user data
    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        status: user.status, // Include status in the response
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
//users baalnce

const getUserBalanceController = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await UserModel.findById(id);

    if (!user) {
      return res
        .status(204)
        .json({ success: false, message: "Account not found." });
    }
    // Save the updated user data
    await user.save();

    // Respond with success and the updated user data
    res.json({
      success: true,
      balances: user.balances,
    });
  } catch (error) {
    console.error("Error  :", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Function to send OTP via email
const sendOtpEmail = async (email, name, verificationToken) => {
  // Configure the email transport using nodemailer
  const transporter = createTransporter();

  // Email options
  const mailOptions = {
    from: process.env.AUTH_EMAIL_P,
    to: email,
    subject: "Welcome to PQS",
    html: `<div style="background: #0E2340 ; text-align: center;">
     <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px; " >PQS</h1>
  </div>
  <div style=" padding: 20px; font-size: 17px;  ">
    <p style="font-size: 17px;  ">Dear   ${name},  <br> <br> 
     Thank you for registering with PQS. Please verify your email by using the below code.</h5>
       <div style="color: #0E2340;  display: inline-block; padding: 10px 20px; border-radius: 4px; font-size: 30px; letter-spacing: 1.5px;">
                <strong>${verificationToken}</strong>
            </div>
     <p style="color: #333; font-size: 17px; margin-bottom: 5px;">Please use the  OTP to complete your registration process. This OTP is valid for 10 minutes.</p>
    <h5 style="font-size: 17px;">Best regards,<br>PQS Team</h5>
    
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <h6>This is an automated message, please do not reply to this email.</h6>
  </div>`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

const sendOtpLoginEmail = async (email, name, verificationToken) => {
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

const sendWelcomeEmail = async (email, name) => {
  // Configure the email transport using nodemailer
  const transporter = createTransporter();

  // Email options
  const mailOptions = {
    from: process.env.AUTH_EMAIL_P,
    to: email,
    subject: "Welcome to PQS",
    html: `<div style="background: #0E2340 ; text-align: center;">
     <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px; " >PQS</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="font-size: 17px;" >Hello   ${name},  </p> 
        
    <p style="font-size: 17px;">Your account has successfully been verified, please use the link below to access the dashboard.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/dashboard/user" style="font-size: 30px; background: #0E2340; color:#fff;padding:10px 30px;border-radius:5px;text-decoration:none">Dashboard</a>
    </div>
     
    <h5 style="font-size: 17px;">Best regards,<br>PQS Team</h5>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
    <h6>This is an automated message, please do not reply to this email.</h6>
  </div>`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
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
  registerController,
  loginController,
  forgotPasswordController,
  verifyEmailController,
  logoutController,
  resetPasswordController,
  checkAuth,
  otpSendController,
  changeEmailController,
  verifyLoginController,
  LoginOtpAgainController,
  getAlluserController,
  profileUpdateController,
  addUserAdminController,
  getSingleUserController,
  userUpdateController,
  getAllVerifiedUserController,
  getUserBalanceController,
  getUserDataController,
  UserProfileUpdateController,
};
