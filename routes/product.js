const express = require('express');
const router = express.Router();

const { addProduct, getProduct, deleteProduct, getProductByTitle, editProduct, getProductById } = require('../controllers/productController');

// More specific routes should come first
router.post('/add', addProduct);
router.get('/all', getProduct);
router.get('/all/:id', getProductById);
router.delete('/delete/:id', deleteProduct);
router.put('/:id', editProduct);
router.get('/:title', getProductByTitle);

module.exports = router;