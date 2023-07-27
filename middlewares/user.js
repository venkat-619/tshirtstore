const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const customErrorClass = require('../utils/customError');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    // header is for mobile sometimes comes from mobile thorugh headers
    const token = req.cookies.token || req.header('Authorization').replace('Bearer ', '');

    if(!token) {
        return next( new customErrorClass(`Login first to access this page ...`, 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
});
  
exports.customRole = (...roles) => {
    return (req, res, next) => {
        // since, we are spreading roles, admin string passed from routes will get added to roles array
        // and from req.user.role, we will get role from database.

        if(!roles.includes(req.user.role)){
            return next(new customErrorClass(`You are not allowed for this source ...`, 403));
        }
        next();
    }
}




// here we are spreading using ...
// ... used in objects, array and functions

// in function

// function sum(...numbers) {
// 	return numbers.reduce((accumulator, current) => {
// 		return accumulator += current;
// 	});
// };
 
// sum(1,2) // 3
// sum(1,2,3,4,5) // 15

// In array

// const numbers1 = [1, 2, 3, 4, 5];
// const numbers2 = [ ...numbers1, 1, 2, 6,7,8]; // this will be [1, 2, 3, 4, 5, 1, 2, 6, 7, 8]

// in objects

// const adrian = {
//     fullName: 'Adrian Oprea',
//     occupation: 'Software developer',
//     age: 31,
//     website: 'https://oprea.rocks'
//   };

// const bill = {
//     ...adrian,
//     fullName: 'Bill Gates',
//     website: 'https://microsoft.com'
//  };

// it just overwrites above above adrian values with given values then rest all are same