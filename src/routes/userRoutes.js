const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/*--------------------------------user Routes-------------------------------*/
router.post("/sendOtp", userController.sendOtp)
router.post("/verifyOtp", userController.verifyOTP)
router.post("/resendOTP", userController.resendOTP)

module.exports = router;

