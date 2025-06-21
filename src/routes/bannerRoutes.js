const express = require("express");
const router = express.Router();
const bannerController = require("../controller/bannerController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Banner Routes-------------------------------*/
router.post("/createbanner",isAuth, isAdmin,bannerController.createBanner)
router.post("/remove",isAuth, isAdmin,bannerController.removeBanner)
router.post("/listing",isAuth,isAdmin, bannerController.listingBanner);
router.post("/fetchBanners", bannerController.fetchAllBanners)
router.post("/update/:id",isAuth,isAdmin, bannerController.updateBanner)
router.post("/delete/:id",isAuth, isAdmin,bannerController.deleteBanner)

module.exports = router;

