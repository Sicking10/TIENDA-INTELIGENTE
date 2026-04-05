const Order = require('../../models/Order');
const User = require('../../models/User');
const { sendOrderEmails } = require('../../services/email/emailServiceBrevo');

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

        // Obtener el usuario completo para el correo
        const user = await User.findById(req.user.id);
        if (!user) {
            console.error('❌ Usuario no encontrado:', req.user.id);
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Crear el pedido
        const order = await Order.create({
            userId: req.user.id,
            items: items.map(item => ({
                productId: String(item.productId),
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

        // Preparar datos para el correo
        const orderForEmail = {
            orderNumber: order.orderNumber,
            items: order.items,
            subtotal: order.subtotal,
            discount: order.discount,
            discountCode: order.discountCode,
            shippingCost: order.shippingCost,
            total: order.total,
            paymentMethod: order.paymentMethod,
            shipping: order.shipping,
            status: order.status,
            createdAt: order.createdAt
        };

        const userForEmail = {
            name: user.name,
            email: user.email,
            phone: user.phone || shipping?.phone || 'No especificado'
        };

        // Enviar correos
        sendOrderEmails(orderForEmail, userForEmail)
            .then(result => {
                console.log('📧 Resultado envío de correos:', {
                    customer: result.customer.success ? '✅ Enviado' : `❌ ${result.customer.error}`,
                    store: result.store.success ? '✅ Enviado' : `❌ ${result.store.error}`
                });
            })
            .catch(emailError => {
                console.error('❌ Error en envío de correos:', emailError);
            });

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
            orderNumber: req.params.id,
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

// @desc    Cancelar un pedido (notifica a cliente Y tienda)
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

        const oldStatus = order.status;
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        await order.save();

        // Obtener el usuario
        const user = await User.findById(req.user.id);
        
        // 🔥 ENVIAR CORREO DE CANCELACIÓN A CLIENTE Y TIENDA 🔥
        if (user && user.email) {
            const { sendCancellationEmails } = require('../../services/email/emailService');
            
            const orderForEmail = {
                orderNumber: order.orderNumber,
                items: order.items,
                subtotal: order.subtotal,
                discount: order.discount,
                discountCode: order.discountCode,
                shippingCost: order.shippingCost,
                total: order.total,
                paymentMethod: order.paymentMethod,
                shipping: order.shipping,
                status: order.status,
                createdAt: order.createdAt
            };

            const userForEmail = {
                name: user.name,
                email: user.email,
                phone: user.phone || order.shipping?.phone || 'No especificado'
            };

            sendCancellationEmails(orderForEmail, userForEmail)
                .then(result => {
                    console.log('📧 Cancelación - Resultado:', {
                        customer: result.customer.success ? '✅ Enviado' : `❌ ${result.customer.error}`,
                        store: result.store.success ? '✅ Enviado' : `❌ ${result.store.error}`
                    });
                })
                .catch(emailError => {
                    console.error('❌ Error en cancelación de correos:', emailError);
                });
        }

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

// @desc    Actualizar estado de un pedido (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido'
            });
        }

        const order = await Order.findOne({ orderNumber: req.params.id });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        const oldStatus = order.status;
        order.status = status;
        
        if (status === 'shipped') {
            order.shippedAt = new Date();
        }
        if (status === 'delivered') {
            order.deliveredAt = new Date();
        }
        
        await order.save();

        // 🔥 ENVIAR CORREO DE ACTUALIZACIÓN DE ESTADO AL CLIENTE
        const user = await User.findById(order.userId);
        if (user && user.email && oldStatus !== status) {
            sendOrderStatusEmail(order, user, oldStatus, status).catch(console.error);
        }

        res.json({
            success: true,
            message: 'Estado del pedido actualizado',
            order
        });

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado del pedido'
        });
    }
};