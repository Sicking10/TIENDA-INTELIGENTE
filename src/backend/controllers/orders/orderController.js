const Order = require('../../models/Order');
const User = require('../../models/User');

// @desc    Crear un nuevo pedido
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        console.log('📦 Recibido pedido:', JSON.stringify(req.body, null, 2));

        const {
            items,
            subtotal,
            discount,
            discountCode,
            shippingCost,
            total,
            paymentMethod,
            shipping
        } = req.body;

        // Validar que haya items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El pedido debe tener al menos un producto'
            });
        }

        // Validar campos requeridos
        if (!subtotal || !total || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: subtotal, total o paymentMethod'
            });
        }

        // Crear el pedido - productId ahora es String, no ObjectId
        const order = await Order.create({
            userId: req.user.id,
            items: items.map(item => ({
                productId: String(item.productId), // Asegurar que sea string
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                concentration: item.concentration || '',
                image: item.image || ''
            })),
            subtotal: Number(subtotal),
            discount: Number(discount) || 0,
            discountCode: discountCode || null,
            shippingCost: Number(shippingCost) || 0,
            total: Number(total),
            paymentMethod: paymentMethod,
            shipping: {
                method: shipping.method,
                address: shipping.address,
                recipientName: shipping.recipientName,
                phone: shipping.phone
            }
        });

        console.log('✅ Pedido creado:', order.orderNumber);

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        
        // Enviar error detallado en desarrollo
        res.status(500).json({
            success: false,
            message: 'Error al crear el pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.errors : undefined
        });
    }
};

// @desc    Obtener todos los pedidos del usuario
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pedidos'
        });
    }
};

// @desc    Obtener un pedido específico
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            orderNumber: req.params.id,  // Buscar por orderNumber en lugar de _id
            userId: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el pedido'
        });
    }
};

// @desc    Cancelar un pedido
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            orderNumber: req.params.id,
            userId: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        if (order.status !== 'pending' && order.status !== 'processing') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar un pedido que ya está en camino o entregado'
            });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        await order.save();

        res.json({
            success: true,
            message: 'Pedido cancelado exitosamente',
            order
        });

    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar el pedido'
        });
    }
};