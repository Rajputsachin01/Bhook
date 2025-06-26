const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/sendOtp", userController.sendOtp)
router.post("/verifyOtp", userController.verifyOTP)
router.post("/resendOTP", userController.resendOTP)
router.post("/fetchClient",isAuth, userController.fetchClient)
router.post("/search",isAuth, userController.searchContent)

module.exports = router;

