const express = require('express');
const router = express.Router();

const {signup, 
    login, 
    logout, 
    forgotPassword, 
    passwordReset, 
    getLoggedInDetails, 
    changePassword,
    updateUserDetails,
    adminAllUsers,
    managerAllUsers,
    adminGetOneUser,
    adminUpdateOneUserDetails,
    adminDeleteOneUser} = require('../controllers/userController');


const { isLoggedIn, customRole } = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordReset);

// injecting middleware here so only logged in users can access
router.route('/userdashboard').get(isLoggedIn, getLoggedInDetails);
router.route('/password/update').post(isLoggedIn, changePassword);
// here we can use put also since we are editing into it
router.route('/userdashboard/update').post(isLoggedIn, updateUserDetails);

// admin only routes
router.route('/admin/user').get(isLoggedIn, customRole('admin'), adminAllUsers);
router
    .route('/admin/user/:id')
    .get(isLoggedIn, customRole('admin'), adminGetOneUser)
    .put(isLoggedIn, customRole('admin'), adminUpdateOneUserDetails)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOneUser);

// manager only routes
router.route('/manager/user').get(isLoggedIn, customRole('manager'), managerAllUsers);

module.exports = router;