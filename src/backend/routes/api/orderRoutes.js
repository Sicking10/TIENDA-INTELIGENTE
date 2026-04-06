const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus
} = require('../../controllers/orders/orderController');

// 🔥 LOG 1: Entrada a la ruta
router.use((req, res, next) => {
    console.log('🟢 [1] Ruta alcanzada:', req.method, req.originalUrl);
    console.log('🟢 [1] Headers:', req.headers);
    next();
});

// 🔥 LOG 2: Antes de protect
router.use((req, res, next) => {
    console.log('🟢 [2] Antes de protect');
    next();
});

router.use(protect);

// 🔥 LOG 3: Después de protect
router.use((req, res, next) => {
    console.log('🟢 [3] Después de protect - Usuario:', req.user?.email, 'Rol:', req.user?.role);
    next();
});

// 🔥 LOG 4: Antes de la ruta específica
router.put('/:id/status', (req, res, next) => {
    console.log('🟢 [4] Entrando a PUT /:id/status');
    console.log('🟢 [4] ID:', req.params.id);
    console.log('🟢 [4] Body:', req.body);
    next();
}, authorize('admin'), updateOrderStatus);

// Rutas normales
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;