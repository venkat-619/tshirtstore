const express = require('express');
const router = express.Router();

const { addproduct, 
    getAllProducts, 
    adminGetAllProducts, 
    getSingleProduct, 
    adminUpdateOneProduct,
    adminDeleteOneProduct,
    addReview,
    deleteReview,
    getOnlyReviesForOneProduct} = require('../controllers/productController');

const {isLoggedIn, customRole} = require('../middlewares/user');


// user routes

// anyone can see our products even not logged in user.
// also so that he can understand our quality and content of our products
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(isLoggedIn, getSingleProduct);
router.route('/review').put(isLoggedIn, addReview);  // review can be added only logged in user
router.route('/review').delete(isLoggedIn, deleteReview); // review can be delted by only logged in user
router.route('/reviews').get(getOnlyReviesForOneProduct); // review can be seen by any one

// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addproduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProducts);
router.route('/admin/product/:id')
    .put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct);

module.exports = router;