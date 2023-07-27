const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,  // whenever we send values with spaces at start or end then it remove those. it trims them
        maxlength: [120, 'Product name should not be more than 120 chars']
    },
    price : {
        type: Number,
        required: [true, 'Please provide price of product'],
        maxlength: [6, 'Product price should not be more than 6 digits'],
    },
    description: {
        type: String,
        required: [true, 'Please provide description for product']
    },
    stock : {
        type: Number,
        required: [true, `Please add a number in stock`]
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required:[true, 'Please select Category from short-sleeves, long-sleeves, sweat-shirts, hoodies'],
        enum:{
            values: ['shortsleeves', 'longsleeves', 'sweatshirts', 'hoodies'],
            message: 'Please select Category ONLY from short-sleeves, long-sleeves, sweat-shirts, hoodies'
        }
    },
    brand: {
        type: String,
        required: [true, 'PLease add a brand for clothing']
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberofReviews : {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                // every single object we had added inside database has ObjectId
                // when we look ObjectId it looks like string, but its bson field
                type: mongoose.Schema.ObjectId,
                ref: 'User',  // exactly same name we calling at user model
                required: true,
            },
            name : {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);