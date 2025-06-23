const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { isAuth ,isClient} = require("../utils/auth");

/*--------------------------------Cart Routes-------------------------------*/
router.post("/create",isAuth,cartController.createCart);
router.post("/update/:id",isAuth, cartController.updateCart)
router.post("/delete/:id",isAuth,cartController.deleteCart)
router.post("/removeItem",isAuth,cartController.removeItemFromCart)
router.post("/listingCarts",isAuth,cartController.listingCarts);
module.exports = router;

