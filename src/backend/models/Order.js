const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,  // ← CAMBIAR de ObjectId a String
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    concentration: String,
    image: String
});

const shippingSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['pickup', 'delivery'],
        default: 'delivery'
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'México' }
    },
    recipientName: String,
    phone: String,
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
        // ← QUITAR 'required: true' porque se genera automáticamente
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    discountCode: String,
    shippingCost: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'cash', 'transfer'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    shipping: shippingSchema,
    notes: String,
    deliveredAt: Date,
    cancelledAt: Date
}, {
    timestamps: true
});

// Generar número de pedido automático ANTES de validar
orderSchema.pre('validate', async function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `GIN-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);