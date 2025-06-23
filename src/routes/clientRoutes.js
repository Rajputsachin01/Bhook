const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { isAuth,isClient } = require("../utils/auth");

/*--------------------------------Client Routes-------------------------------*/
router.post("/register", clientController.registerClient)
router.post("/login", clientController.loginClient)
router.post("/toggleIsActive",isAuth,isClient, clientController.toggleIsActive)

module.exports = router;

