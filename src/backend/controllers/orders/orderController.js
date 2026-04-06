const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product'); // ✅ IMPORTAR PRODUCTO
const { sendOrderEmails, sendCancellationEmails } = require('../../services/email/emailServiceBrevo');

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

        // 🔥 VERIFICAR Y ACTUALIZAR STOCK 🔥
        const stockUpdates = [];
        const stockErrors = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                stockErrors.push(`Producto no encontrado: ${item.name || item.productId}`);
                continue;
            }

            if (product.stock < item.quantity) {
                stockErrors.push(
                    `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`
                );
                continue;
            }

            // Guardar la actualización para después
            stockUpdates.push({
                productId: product._id,
                newStock: product.stock - item.quantity,
                productName: product.name
            });
        }

        // Si hay errores de stock, no crear el pedido
        if (stockErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede procesar el pedido por problemas de stock',
                errors: stockErrors
            });
        }

        // 🔥 APLICAR ACTUALIZACIONES DE STOCK 🔥
        for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(update.productId, {
                stock: update.newStock
            });
            console.log(`📦 Stock actualizado: ${update.productName} → ${update.newStock}`);
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

        // 🔥 RESTAURAR STOCK DE CADA PRODUCTO 🔥
        const stockRestore = [];
        
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            
            if (product) {
                const newStock = product.stock + item.quantity;
                await Product.findByIdAndUpdate(item.productId, {
                    stock: newStock
                });
                stockRestore.push({
                    productName: product.name,
                    quantity: item.quantity,
                    newStock: newStock
                });
                console.log(`🔄 Stock restaurado: ${product.name} +${item.quantity} → ${newStock}`);
            } else {
                console.warn(`⚠️ Producto no encontrado para restaurar stock: ${item.productId}`);
            }
        }

        const oldStatus = order.status;
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        await order.save();

        // Obtener el usuario
        const user = await User.findById(req.user.id);
        
        // 🔥 ENVIAR CORREO DE CANCELACIÓN A CLIENTE Y TIENDA 🔥
        if (user && user.email) {
            
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
            order,
            stockRestored: stockRestore // Opcional: informar qué stock se restauró
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
        const orderId = req.params.id;
        
        // 🔥 LOGS PARA DEPURAR 🔥
        console.log('═══════════════════════════════════════');
        console.log('📝 Actualizando pedido:');
        console.log('   - ID recibido:', orderId);
        console.log('   - Nuevo estado:', status);
        console.log('   - Body completo:', req.body);
        console.log('═══════════════════════════════════════');
        
        // 🔥 ESTADOS VÁLIDOS PARA AMBOS TIPOS DE PEDIDO 🔥
        const validStatuses = [
            'pending', 'processing', 'shipped', 'delivered', 
            'ready_for_pickup', 'picked_up', 'cancelled'
        ];

        if (!validStatuses.includes(status)) {
            console.log('❌ Estado no válido en la lista:', status);
            return res.status(400).json({
                success: false,
                message: `Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`
            });
        }

        // Buscar por _id o orderNumber
        let order = await Order.findById(orderId);
        
        if (!order) {
            console.log('🔍 No encontrado por _id, buscando por orderNumber...');
            order = await Order.findOne({ orderNumber: orderId });
        }
        
        if (!order) {
            console.log('❌ Pedido NO encontrado con:', orderId);
            return res.status(404).json({
                success: false,
                message: `Pedido no encontrado con ID: ${orderId}`
            });
        }

        console.log('✅ Pedido ENCONTRADO:');
        console.log('   - orderNumber:', order.orderNumber);
        console.log('   - status actual:', order.status);
        console.log('   - shipping.method:', order.shipping?.method);
        console.log('   - userId:', order.userId);

        const oldStatus = order.status;
        const isPickup = order.shipping?.method === 'pickup';
        
        console.log(`📦 Tipo de pedido: ${isPickup ? 'RECOGER EN TIENDA' : 'ENVÍO A DOMICILIO'}`);
        
        // 🔥 VALIDAR QUE EL ESTADO SEA COHERENTE CON EL TIPO DE PEDIDO 🔥
        if (isPickup) {
            if (status === 'shipped' || status === 'delivered') {
                console.log('❌ Error: Estado de delivery en pedido pickup');
                return res.status(400).json({
                    success: false,
                    message: 'No se puede usar "Enviado" o "Entregado" para pedidos de recoger en tienda'
                });
            }
        } else {
            if (status === 'ready_for_pickup' || status === 'picked_up') {
                console.log('❌ Error: Estado de pickup en pedido delivery');
                return res.status(400).json({
                    success: false,
                    message: 'No se puede usar "Listo para recoger" o "Recogido" para pedidos de envío a domicilio'
                });
            }
        }
        
        // 🔥 Si se cancela desde admin, también restaurar stock 🔥
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            console.log('🔄 Cancelando pedido, restaurando stock...');
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    await Product.findByIdAndUpdate(item.productId, {
                        stock: product.stock + item.quantity
                    });
                    console.log(`   Stock restaurado: ${product.name} +${item.quantity}`);
                }
            }
        }
        
        // 🔥 Registrar fechas según el estado
        if (status === 'picked_up' && oldStatus !== 'picked_up') {
            order.pickedUpAt = new Date();
            console.log('📅 Fecha de recogida registrada:', order.pickedUpAt);
        }
        
        if (status === 'ready_for_pickup' && oldStatus !== 'ready_for_pickup') {
            order.readyForPickupAt = new Date();
            console.log('📅 Fecha lista para recoger:', order.readyForPickupAt);
        }

        order.status = status;
        
        // Fechas para delivery
        if (status === 'shipped') {
            order.shippedAt = new Date();
            console.log('📅 Fecha de envío registrada:', order.shippedAt);
        }
        if (status === 'delivered') {
            order.deliveredAt = new Date();
            console.log('📅 Fecha de entrega registrada:', order.deliveredAt);
        }
        
        await order.save();

        console.log(`✅ Pedido ACTUALIZADO: ${order.orderNumber} → ${status}`);
        console.log('═══════════════════════════════════════\n');

        // 🔥 ENVIAR CORREO DE ACTUALIZACIÓN DE ESTADO AL CLIENTE
        const user = await User.findById(order.userId);
        if (user && user.email && oldStatus !== status) {
            try {
                const { sendOrderStatusEmail } = require('../../services/email/emailService');
                await sendOrderStatusEmail(order, user, oldStatus, status);
                console.log('📧 Correo de actualización enviado');
            } catch (emailError) {
                console.error('❌ Error al enviar correo:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Estado del pedido actualizado',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                shipping: order.shipping
            }
        });

    } catch (error) {
        console.error('❌ Error en updateOrderStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado del pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};