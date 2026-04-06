const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    shortName: {
        type: String,
        default: ''
    },
    imageUrl: {
    type: String,
    default: ''
},
    concentration: {
        type: String,
        required: [true, 'La concentración es requerida']
    },
    tag: {
        type: String,
        default: null
    },
    tagType: {
        type: String,
        enum: ['gold', 'crimson', null],
        default: null
    },
    image: {
        type: String,
        default: 'placeholder.jpg'
    },
    imageAlt: {
        type: String,
        default: ''
    },
    desc: {
        type: String,
        required: [true, 'La descripción es requerida']
    },
    longDesc: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: 0
    },
    oldPrice: {
        type: Number,
        default: null
    },
    rating: {
        type: Number,
        default: 4.5
    },
    reviews: {
        type: Number,
        default: 0
    },
    benefits: [{
        type: String
    }],
    ritual: {
        type: String,
        default: 'Tomar 1 cápsula al día con agua.'
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);