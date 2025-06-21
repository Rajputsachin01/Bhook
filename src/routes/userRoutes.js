const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", userController.registerUser)
router.post("/update", isAuth, userController.updateUser)
router.post("/remove", isAuth, userController.removeUser)
router.post("/fetchProfile", isAuth, userController.fetchProfile)
router.post("/findById", userController.findUserById)
router.post("/login", userController.loginUser)
router.post("/verifyOtp", userController.verifyOTP)
router.post("/resendOTP", userController.resendOTP)
router.post("/forgotPassword",userController.forgotPassword)
router.post("/verifyForgetOtp",  userController.verifyResetPasswordOtp)
router.post("/resendForgetOtp",  userController.resendResetPasswordOtp)
router.post("/resetPassword",userController.resetPassword)
/*--------------------------------Admin Panel Side Routes-------------------------------*/
router.post("/listingUser", userController.listingUser)

module.exports = router;

