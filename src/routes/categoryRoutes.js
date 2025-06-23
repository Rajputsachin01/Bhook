const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { isAuth ,isClient} = require("../utils/auth");

/*--------------------------------Category Routes-------------------------------*/
router.post("/create",isAuth,isClient,categoryController.createCategory)
router.post("/update/:id",isAuth,isClient, categoryController.updateCategory)
router.post("/delete/:id",isAuth, isClient,categoryController.deleteCategory)
router.post("/list",isAuth,categoryController.listCategories);
module.exports = router;

