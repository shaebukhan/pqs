const express = require("express");
const { registerController, loginController, forgotPasswordController, verifyEmailController, logoutController, resetPasswordController, checkAuth, otpSendController, changeEmailController, verifyLoginController, LoginOtpAgainController, getAlluserController, profileUpdateController, addUserAdminController, getSingleUserController, userUpdateController, getAllVerifiedUserController, getUserBalanceController, getUserDataController, UserProfileUpdateController } = require("../controllers/authController");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { verifyToken } = require("../middlewares/verifyToken");
const { contactFormController } = require("../controllers/contactController");
const router = express.Router();

//Register Route
router.post("/register", registerController);
// verify 
router.post("/verify-email", verifyEmailController);
router.post("/verify-login", verifyLoginController);
router.post("/login-otp-again", LoginOtpAgainController);
//login route
router.post("/login", loginController);
//again otp send
router.post("/send-otp-again", otpSendController);
//change email
router.post("/change-email", changeEmailController);
//logout
router.post("/logout", logoutController);
//Forgot password 
router.post("/forgot-password", forgotPasswordController);
//reset password 
router.post("/reset-password/:token", resetPasswordController);
//check auth 
router.get("/check-auth", verifyToken, checkAuth);
//test route 
router.get("/m-users", requireSignIn, isAdmin, getAlluserController);
router.get("/all-v-users", requireSignIn, isAdmin, getAllVerifiedUserController);
//update profile
router.post("/update-profile/:id", requireSignIn, isAdmin, profileUpdateController);
router.post("/update-profile-user/:id", requireSignIn, UserProfileUpdateController);
//update user 
router.post("/update-user/:id", requireSignIn, isAdmin, userUpdateController);
//add user by admin 
router.post("/add-user", requireSignIn, isAdmin, addUserAdminController);
//get single user 
router.get("/get-user/:id", requireSignIn, isAdmin, getSingleUserController);
//get user balance 
router.get("/get-user-b/:id", requireSignIn, getUserBalanceController);
//get user data 
router.get("/get-user-data/:id", requireSignIn, getUserDataController);
router.post("/submit-complaint", contactFormController);
//admin route 
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({
        ok: true
    });
});

module.exports = router;