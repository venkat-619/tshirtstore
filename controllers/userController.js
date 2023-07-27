const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const customErrorClass = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');

exports.signup = BigPromise(async (req, res, next) => {

    if(!req.files){
        return next(new customErrorClass("Photo is required for signup", 400));
    }

    const {name, email, password} = req.body;

    if(!email || !password || !name){
        return next(new customErrorClass('Name, Email and password are required', 400));
    }

    let file = req.files.photo;

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale",
    });

    const user = await User.create({
        name,
        email,
        password,
        photo : {
            id: result.public_id,
            secure_url: result.secure_url,
        },
    });

    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
    const {email, password} = req.body;

    // checking for presence of email and password
    if(!email || !password){
        return next(new customErrorClass(`please provide email and password`, 400));
    }

    // getting user from database
    const user = await User.findOne({email}).select("+password");

    // checking if user exist or not
    if(!user){
        return next(new customErrorClass(`Email or password does not match or not exist`, 400));
    }

    // matching the password
    const isCorrectPassword = await user.isValidatedPassword(password);

    // if password doesn't match
    if(!isCorrectPassword){
        return next(new customErrorClass(`Email or password does not match or not exist`, 400));
    }

    // if everything goes good we send token
    cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    // clearing token from  cookies
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    // success message
    res.status(200).json({
        success: true,
        message: "Logout Successfull !!!"
    });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const {email} = req.body;

    // finding user in database
    const user = await User.findOne({email});

    // if user not found in database
    if(!user) {
        return next(new customErrorClass('Email not found as registered', 400));
    }

    // getting token from user models
    const forgotToken = user.getForgotPasswordToken();

    // save user in db
    // it temporarily not check everything. it saves data however we are asking it to save
    user.save({validateBeforeSave: false});

    // creating a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    // creating a message
    const message = `Copy paste this link in your url and hit enter. Url is : ${myUrl}`;

    // attempt to send message
    try{

        await mailHelper({
            email: user.email,
            subject: "Password reset Email TshirtStore",
            message
        });
        
        // if it success then snding success message
        res.status(200).json({
            success: true,
            message: "Email Sent Successfully !!!"
        })

    } catch(error){
        // if it fails to send we have to undo allchanges
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        user.save({validateBeforeSave: false});

        return next(new customErrorClass(error.message, 500));
    }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
    // getting token from params
    const token = req.params.token;

    // encrypting token using cryptohash
    const encryToken = crypto.createHash("sha256").update(token).digest("hex");

    // finding user based on encryToken and expiry
    const user = await User.findOne({
        forgotPasswordToken: encryToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    });

    // checking user exist or not
    if(!user){
        return next(new customErrorClass(`Token is invalid or expired !!!`, 400));
    }

    // checking if password and confirm password or same
    if(req.body.password !== req.body.confirmPassword){
        return next(new customErrorClass(`password and confirm password are not same`, 400));
    }

    user.password = req.body.password;
    
    // resetting forgot password fields
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    
    // saving the token
    await user.save();

    // sending a JSON response or success message
    cookieToken(user, res);
});

exports.getLoggedInDetails = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    // sending response here
    res.status(200).json({
        success: true,
        user
    });
});

exports.changePassword = BigPromise(async (req, res, next) => {
    // getting user from middleware
    const userId = req.user.id;

    // getting user from db
    const user = await User.findById(userId).select("+password");

    const isCorrectOldPassword = user.isValidatedPassword(req.body.oldPassword);

    if(!isCorrectOldPassword){
        return next(new customErrorClass(`Old password is incorrect ...`, 400));
    }

    // we are saving new password to user
    user.password = req.body.password;
    await user.save();

    // sending cookie
    cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {

    // adding a check for email and name should present
    if(!req.body.email || !req.body.name){
        return next(new customErrorClass(`email and name should present !!!`, 400));
    }

    // front end guys send all existing data and user is allowed to change whatever data is changing
    // and sends all data while updation
    const newData = {
        name: req.body.name,
        email: req.body.email,
    };

    // if files present
    if(req.files){
        // getting user from db
        const user = await User.findById(req.user.id);
        // getting photo id
        const imageId = user.photo.id;

        // deleting photo on cloudinary
        const resp = await cloudinary.v2.uploader.destroy(imageId);

        // uploading new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        });

        // now updating photo object into db
        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url,
        }
    }

    // updating into database user
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,               // grabs new updated user whatever we send into user after updation
        runValidators: true,     // it runs validators like email in valid format or not
        useFindAndModify: false  // in some previous versions findAndModify used now we don't need so setted as false
    });

    // sending response
    res.status(200).json({
        success: true,
        user
    });
});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
    // if we leave it empty then it return every one in db
    const user = await User.find();

    // sending all users
    res.status(200).json({
        success: true,
        user
    });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
    // getting user based on id
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new customErrorClass(`No user Found`, 400));
    }

    // sending response and user
    res.status(200).json({
        success: true,
        user
    });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {

    // adding a check for email and name should present
    if(!req.body.email || !req.body.name || !req.body.role){
        return next(new customErrorClass(`email and name should present !!!`, 400));
    }

    // front end guys send all existing data and user is allowed to change whatever data is changing
    // and sends all data while updation
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    // updating into database user
    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,               // grabs new updated user whatever we send into user after updation
        runValidators: true,     // it runs validators like email in valid format or not
        useFindAndModify: false  // in some previous versions findAndModify used now we don't need so setted as false
    });

    // sending response
    res.status(200).json({
        success: true,
        user
    });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
    // get user from url
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new customErrorClass(`No Such User Found !!!`, 401));
    }

    // getting image id from user
    const imageId = user.photo.id;
    
    // deleting image in cloudinary
    await cloudinary.v2.uploader.destroy(imageId);

    // remove user from database
    // remove function is deprecated in mongoose 5.x version so we have to use deleteOne or deleteMany

    // await user.remove();

    // deleting user
    await User.deleteOne({_id: req.params.id});

    res.status(200).json({
        success: true
    });
});

exports.managerAllUsers = BigPromise(async (req, res, next) => {
    // getting all users with user role
    const users = await User.find({ role: 'user'});

    // sending all users
    res.status(200).json({
        success: true,
        users
    });

});