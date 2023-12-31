const express = require('express');
const router = express.Router();

const { createOrder, 
    getOneOrder, 
    getLoggedInOrders,
    adminGetAllOrders,
    adminUpdateOrder,
    adminDeleteOrder} = require('../controllers/orderController');
const {isLoggedIn, customRole} = require('../middlewares/user');

// here it can be bettered by taking /order/:productId/create then we can take lot of info
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
// ordering is important so /:id should come at last only
router.route("/myorder").get(isLoggedIn, getLoggedInOrders);

// admin routes
router.route("/admin/orders").get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router
    .route("/admin/order/:id")
    .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
    .delete(isLoggedIn, customRole("admin"), adminDeleteOrder);

module.exports = router;