const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
    getProducts,
    getProductById
} = require('../../controllers/products/productController');

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;