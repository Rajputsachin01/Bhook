const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const { isAuth ,isClient} = require("../utils/auth");

/*--------------------------------Item Routes-------------------------------*/
router.post("/create",isAuth,isClient,itemController.createItem);
router.post("/update/:id",isAuth,isClient, itemController.updateItem)
router.post("/delete/:id",isAuth, isClient,itemController.deleteItem)
router.post("/toggleIsPublished",isAuth,isClient, itemController.toggleIsPublished)
router.post("/toggleIsAvailable",isAuth,isClient, itemController.toggleIsAvailable)
router.post("/listByCategory",isAuth,itemController.listByCategory);
router.post("/listingItems",isAuth,isClient,itemController.listingItems);
module.exports = router;

