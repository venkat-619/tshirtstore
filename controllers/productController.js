const Product = require('../models/product');
const BigPromise = require('../middlewares/bigPromise');
const customErrorClass = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereClause = require('../utils/whereClause');
const product = require('../models/product');

exports.addproduct = BigPromise(async (req, res, next) => {
    // images
    let imageArray = [];
    if(!req.files){
        return next(new customErrorClass(`Images are required !!!`, 401));
    }

    // if files present we are pushing in image array
    if(req.files){

        // here there is an edge case when we send single photo then it says undefined because
        // req.files.photos return object if there is an single photo
        // if there are multiple photo it returns array so here length works fine

        let images = [];
        // to check wether it is single photo or multiple photo
        // Object.prototype.toString.call() to get the internal [[Class]] property of an object and check 
        // if it equals "[object Object]"
        if(Object.prototype.toString.call(req.files.photos) === "[object Object]"){
            images.push(req.files.photos);
        } else {
            images = [...req.files.photos];
        }
        
        // req.files.photos.length
        for(let index = 0; index < images.length; index++){
            let result = await cloudinary.v2.uploader.upload(images[index].tempFilePath, {
                folder: "Products"
            });

            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }
    }

    // pushing photos and user id in body
    req.body.photos = imageArray;
    req.body.user = req.user.id;

    // creating prouct in databse
    const product = await Product.create(req.body);

    // sending response
    res.status(200).json({
        success: true,
        product
    });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {

    // how many Products per page we want to show them
    const resultPerPage = 6;

    // how many products are then in database it gives it
    const totalCountProduct = await Product.countDocuments();

    // we created object on where clause and passed query
    // we added products based on search and filter criteria
    const productObj = new whereClause(Product.find(), req.query).search().filter();

    // since we have to find query we have to run as .base
    let products = await productObj.base;

    // it gives number of products length we got after filtered
    const filterProductLength = products.length;


    // here filtering out products based on pages. based on page we are giving values

    // if we have to work fine we have to use .clone() 
    // because in mongoose chained query .find().find()... are not allowed in multiple times
    // so, all we have to do is to add clone() to run query
    productObj.pager(resultPerPage);
    products = await productObj.base.clone();


    res.status(200).json({
        success: true,
        products,
        filterProductLength,
        totalCountProduct
    });
});

exports.getSingleProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new customErrorClass(`There is no product with given id`, 401));
    }

    res.status(200).json({
        success: true,
        product
    });
});

exports.addReview = BigPromise(async (req, res, next) => {
    const {rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    const product = await Product.findById(productId);

    // here rev is iterating itself
    // _id is bson object so we are converting it into string
    const alreadyReview = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString());

    if(alreadyReview){
        product.reviews.forEach( (review) => {
            if(review.user.toString() === req.user._id.toString()){
                review.comment = comment;
                review.rating = rating;
            }
        });
    } else {
        product.reviews.push(review);
        product.numberofReviews = product.reviews.length;
    }

    // adjust ratings
    // here The reduce() method takes two arguments: a callback function and an initial value for the accumulator.
    // 0 is the initial value of accumulator on item we are adding rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    // save
    // we are updating lot of fields so we are turing of flag
    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
    // this product id can comey in anywhere but recommended way to come in as query
    const {productId} = req.query;

    const product = await Product.findById(productId);

    // filter out actually allows or pass on all the values but whereever condition doesn't matches out
    // it doesn't allow you to pass that string
    const reviews = product.reviews.filter((rev) => rev.user.toString() !== req.user._id.toString());

    // updating number of reviews
    const numberofReviews = reviews.length;

    // adjust ratings
    const ratings = product.reviews.reduce((acc, item) => item.rating, 0) / reviews.length;

    // update all products
    // when you update you mutate the exisitng record so here we are mutating theproduct and 
    // we are saving changes made in product using saveas we can update the ratings in runtime 
    await Product.findByIdAndUpdate(productId, {
        reviews,
        ratings,
        numberofReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    });
});

exports.getOnlyReviesForOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});


// admin only controllers

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
    // here we made of error by making as const fixed to let
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new customErrorClass(`No Product found with this id`, 401));
    }

    let imageArray = []

    if(req.files){

        // destroy exisiting images
        for(let index = 0; index < product.photos.length; index++){
            const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
        }

        // upload and save images
        let images = [];
        if(Object.prototype.toString.call(req.files.photos) === "[object Object]"){
            images.push(req.files.photos);
        } else {
            images = [...req.files.photos];
        }

        for (let index = 0; index < images.length; index++) {
            let result = await cloudinary.v2.uploader.upload(images[index].tempFilePath, {
                folder: "Products" // this need to go in .env so that no one can change that
            });
            
            imageArray.push({
                id : result.public_id,
                secure_url: result.secure_url
            });
        }

        req.body.photos = imageArray;
    }

    // updating into database what are we are giving
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new customErrorClass(`No Product found with this id`, 401));
    }

    // destroying all images in cloudinary
    for(let index = 0; index < product.photos.length; index++){
        const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
    }

    // we can remove using product.remove(); but its deprecated in new versions
    await Product.deleteOne({_id: req.params.id});

    // sending response
    res.status(200).json({
        success: true,
        message: "Product was deleted successfully"
    });
});