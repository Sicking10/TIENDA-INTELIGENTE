const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');

// @desc    Obtener todos los posts publicados
// @route   GET /api/blog
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Obtener un post por ID
// @route   GET /api/blog/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        }
        // Incrementar vistas
        post.views = (post.views || 0) + 1;
        await post.save();
        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;