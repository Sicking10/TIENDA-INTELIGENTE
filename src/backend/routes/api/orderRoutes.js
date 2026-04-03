const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder
} = require('../../controllers/orders/orderController');

router.use(protect); // Todas las rutas requieren autenticación

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;