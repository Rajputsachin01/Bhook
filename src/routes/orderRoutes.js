const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { isAuth ,isClient} = require("../utils/auth");

/*--------------------------------Order Routes-------------------------------*/
router.post("/create",isAuth,orderController.createOrder);//for order create (the price and total subTotal fee and many more details are calculated here )
router.post("/update/:id",isAuth, orderController.updateOrder)//its just to update the order like orderDate time and mny more 
router.post("/delete/:id",isAuth,orderController.deleteOrder)//it delete the order like soft delete just isDeleted make true
router.post("/updateOrderStatus/:id",isAuth,isClient, orderController.updateOrderStatus)//in this client want to update the status so it gave us the status and we have to just update it 
router.post("/ListingOrderByStatus",isAuth,isClient,orderController.ListingOrderByStatus);//make a full paginated and listing Api in which user gave orderStatus and fetch them based on that 
router.post("/fetchOrder",isAuth,orderController.fetchOrder);//in this fetch the full order with details of that user by userId in token req.userId
router.post("/fetchOrderHistory",isAuth,orderController.fetchOrderHistory);//in this only those Orders which are status expired collectd and rejected
router.post("/fetchTotal",isAuth,isClient,orderController.verifyPinAndGetTotal);
module.exports = router;

