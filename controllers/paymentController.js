const BigPromise = require('../middlewares/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET)

exports.sendStripekey = BigPromise(async (req, res, next) => {
    res.status(200).json({ 
        stripeKey: process.env.STRIPE_API_KEY
    });
});

// here we are capturing stripe payments
// https://stripe.com/docs/api/payment_intents/create docs

exports.captureStripePayment = BigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',

        // optional
        metadata: { integration_check: "accept_a_payment" }
      });

      res.status(200).json({
        sucess: true,
        amount: req.body.amount,
        client_secret: paymentIntent.client_secret
      });
});

exports.sendRazorpaykey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        razorpaykey: process.env.RAZORPAY_API_KEY
    });
});

// here we are capturing razorpay payments
exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({ 
        key_id: process.env.RAZORPAY_API_KEY, 
        key_secret: process.env.RAZORPAY_SECRET 
    });

    const options = {
        amount: req.body.amount,
        currency: "INR",
        // receipt: "receipt#1", // here we can use crypto, uuid, nanoid to generate random string for receipt
    };

    const myOrder = await instance.orders.create(options);

    res.status(200).json({
        sucess: true,
        amount: req.body.amount,
        myOrder
    });
});