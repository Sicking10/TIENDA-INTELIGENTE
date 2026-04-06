const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'El extracto es requerido']
    },
    content: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['bienestar', 'recetas', 'rendimiento', 'ciencia', 'consejos'],
        default: 'bienestar'
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    author: {
        type: String,
        default: 'Administrador'
    },
    authorAvatar: {
        type: String,
        default: 'AD'
    },
    tags: [{
        type: String
    }],
    readTime: {
        type: Number,
        default: 5
    },
    views: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: 'placeholder.jpg'
    },
    imageUrl: {
    type: String,
    default: ''
}
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);