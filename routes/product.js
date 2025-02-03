const express = require('express');
const router = express.Router();

const { addProduct, getProduct, deleteProduct, getProductByTitle, editProduct, getProductById } = require('../controllers/productController');


router.post('/add', addProduct);
router.get('/all', getProduct);
router.delete('/delete/:id', deleteProduct);
router.get('/:title', getProductByTitle);
router.put('/:id', editProduct);
router.get('/all/:id', getProductById);

module.exports = router;