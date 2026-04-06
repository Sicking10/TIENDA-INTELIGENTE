const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Post = require('../../models/Post');
const mongoose = require('mongoose');

// Validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Todas las rutas requieren autenticación y rol admin
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// ==================== DASHBOARD STATS ====================

router.get('/users/stats', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/orders/stats', async (req, res) => {
    try {
        const count = await Order.countDocuments();
        
        // Incluir todos los estados excepto cancelled
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        
        res.json({ 
            success: true, 
            count,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/products/stats', async (req, res) => {
    try {
        const count = await Product.countDocuments();
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/orders/recent', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');
        
        const formattedOrders = orders.map(order => ({
            orderNumber: order.orderNumber,
            customerName: order.userId?.name || order.shipping?.recipientName || 'Cliente',
            createdAt: order.createdAt,
            total: order.total,
            status: order.status
        }));
        
        res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GESTIÓN DE USUARIOS ====================

router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
        }
        
        const { role } = req.body;
        
        if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Rol inválido' });
        }
        
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        user.role = role;
        await user.save();
        
        res.json({ success: true, message: 'Rol actualizado', user: user.toPublicJSON() });
        
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GESTIÓN DE PEDIDOS ====================

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.userId?.name || order.shipping?.recipientName || 'Cliente',
            createdAt: order.createdAt,
            total: order.total,
            status: order.status,
            shipping: order.shipping
        }));
        
        res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'ID de pedido inválido' });
        }
        
        const { status } = req.body;
        
        // 🔥 ACTUALIZADO: Incluir estados para pickup
        const validStatuses = [
            'pending',           // Pendiente (ambos)
            'processing',        // Procesando (ambos)
            'shipped',           // Enviado (solo delivery)
            'delivered',         // Entregado (solo delivery)
            'ready_for_pickup',  // Listo para recoger (solo pickup)
            'picked_up',         // Recogido (solo pickup)
            'cancelled'          // Cancelado (ambos)
        ];
        
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}` 
            });
        }
        
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }
        
        const isPickup = order.shipping?.method === 'pickup';
        
        // 🔥 VALIDAR COHERENCIA DEL ESTADO CON EL TIPO DE PEDIDO
        if (isPickup) {
            if (status === 'shipped' || status === 'delivered') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede usar "Enviado" o "Entregado" para pedidos de recoger en tienda'
                });
            }
        } else {
            if (status === 'ready_for_pickup' || status === 'picked_up') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede usar "Listo para recoger" o "Recogido" para pedidos de envío a domicilio'
                });
            }
        }
        
        const oldStatus = order.status;
        order.status = status;
        
        // Registrar fechas según el estado
        if (status === 'shipped') {
            order.shippedAt = new Date();
        }
        if (status === 'delivered') {
            order.deliveredAt = new Date();
        }
        if (status === 'ready_for_pickup') {
            order.readyForPickupAt = new Date();
        }
        if (status === 'picked_up') {
            order.pickedUpAt = new Date();
        }
        if (status === 'cancelled') {
            order.cancelledAt = new Date();
        }
        
        await order.save();
        
        console.log(`✅ Pedido ${order.orderNumber}: ${oldStatus} → ${status}`);
        
        res.json({ 
            success: true, 
            message: 'Estado actualizado correctamente', 
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                shipping: order.shipping
            }
        });
        
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'ID de pedido inválido' });
        }
        
        const order = await Order.findById(id).populate('userId', 'name email');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }
        
        res.json({ success: true, order });
        
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GESTIÓN DE PRODUCTOS ====================

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 🔥 NUEVO ENDPOINT - Productos con stock bajo
router.get('/products/low-stock', async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 5;
        
        const products = await Product.find({
            stock: { $lt: threshold },
            isActive: true
        }).select('name stock concentration image');
        
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Error getting low stock products:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

router.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'ID de producto inválido' });
        }
        
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'ID de producto inválido' });
        }
        
        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GESTIÓN DE BLOG ====================

router.get('/blog', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/blog', async (req, res) => {
    try {
        const post = await Post.create(req.body);
        res.status(201).json({ success: true, post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'ID de artículo inválido' });
        }
        
        const post = await Post.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        if (!post) {
            return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        }
        
        res.json({ success: true, post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'ID de artículo inválido' });
        }
        
        const post = await Post.findByIdAndDelete(id);
        
        if (!post) {
            return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        }
        
        res.json({ success: true, message: 'Artículo eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;