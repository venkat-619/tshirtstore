const express = require('express');
const router = express.Router();

const {sendStripekey, 
    sendRazorpaykey, 
    captureRazorpayPayment, 
    captureStripePayment} = require('../controllers/paymentController');

const {isLoggedIn} = require('../middlewares/user');

router.route('/stripekey').get(isLoggedIn, sendStripekey);
router.route('/razorpaykey').get(isLoggedIn, sendRazorpaykey);

router.route('/capturestripe').post(isLoggedIn, captureStripePayment);
router.route('/capturerazorpay').post(isLoggedIn, captureRazorpayPayment);

module.exports = router;