const Order = require('../models/order');
const Product = require('../models/product');
const BigPromise = require('../middlewares/bigPromise');
const customErrorClass = require('../utils/customError');

exports.createOrder = BigPromise(async (req, res, next) => {
    const {shippingInfo, 
            orderItems, 
            paymentInfo,  // once payment is successfull he should recieve data then he can make request for placing order
            taxAmount,    // recieves from frontend
            shippingAmount,
            totalAmount } = req.body;

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        paymentInfo,  
        taxAmount,  
        shippingAmount,
        totalAmount,
        user: req.user._id  // coming from mongodb bson field
    });

    // here we have to careful on product passing because product._id is bson object

    res.status(200).json({
        success: true,
        order
    });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
    
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    // populate : - which field we want to know further details or get more info

    if(!order){
        return next(new customErrorClass('Please check order id', 401));
    }

    res.status(200).json({
        success: true,
        order
    });
});

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
    
    const order = await Order.find({ user: req.user._id });

    if(!order){
        return next(new customErrorClass('There are no orders you placed !!!', 401));
    }

    res.status(200).json({
        success: true,
        order
    });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
    
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        orders
    });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
    
    // admin can't change shippinginfo, paymentInfo, user, orderItems, taxAmount, shippingAmount
    // only order status can be changed

    const order = await Order.findById(req.params.id);

    if(order.orderStatus === "delivered"){
        return next(new customErrorClass(`Order is already marked as delivered`, 401));
    }

    order.orderStatus = req.body.orderStatus;

    if(req.body.orderStatus === "delivered"){
        order.deliveredAt = Date.now();
    }

    order.orderItems.forEach(async (prod) => {
        await updateProductStock(prod.product, prod.quantity);
    });

    await order.save();

    res.status(200).json({
        success: true,
        orders
    });
});

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    await Order.deleteOne(order);

    res.status(200).json({
        success: true
    });
});

async function updateProductStock(productId, quantity){
    const product = await Product.findById(productId);

    if(product.stock < quantity){
        return next(new customErrorClass(`Quantity is greater than stock`, 401));
    }

    product.stock = product.stock - quantity;

    await product.save({validateBeforeSave: false});
}