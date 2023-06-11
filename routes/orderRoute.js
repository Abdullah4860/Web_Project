const express=require('express');
const { newOrder, getSingleOrder, myOrder, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const router=express.Router();
const { isAuthenticatedUser, authroizeRole } = require('../middleware/auth');


router.route("/order/new").post(isAuthenticatedUser,newOrder);

router.route("/order/:id").get(isAuthenticatedUser,getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser,myOrder);

router.route("/admin/orders").get(isAuthenticatedUser,authroizeRole("admin"),getAllOrders);

router.route("/admin/order/:id").put(isAuthenticatedUser,authroizeRole("admin"),updateOrder)
.delete(isAuthenticatedUser,authroizeRole("admin"),deleteOrder)








module.exports=router;