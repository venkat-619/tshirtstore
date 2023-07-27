const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo : {
        address: {
            type: String,
            required: [true, 'Please provide address']
        },
        city: {
            type: String,
            required: [true, 'Please provide city']
        },
        phoneNo: {
            type: String,
            required: [true, 'Please provide phone number']
        },
        postalCode: {
            type: String,
            required: [true, 'Please provide postal code']
        },
        state: {
            type: String,
            required: [true, 'Please provide state']
        },
        country: {
            type: String,
            required: [true, 'Please provide country']
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,   //mongoose.Schema.Types.ObjectId
        ref: "User",
        required: true
    },
    orderItems: [
        {
            name: {
                type: String,
                required: [true, 'Please provide name']
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {  // here we are injecting secure url only
                type: String,
                requird: true
            },
            price: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    paymentInfo: {  // if we want to create seperate dashboard for paymentInfo then we can add here
        id: {
            type: String
        }
    },
    taxAmount: {
        type: Number,
        required: true
    },
    shippingAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'processing'
    },
    deliveredAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);

// ref link
// https://stackoverflow.com/questions/28997636/should-i-use-schema-types-objectid-or-schema-objectid-when-defining-a-mongoose-s

// we can also use mongoose.Schema.Types.ObjectId  -> newer convention
// we can also use mongoose.Schema.ObjectId  --> this is for backwards compatibility with v2