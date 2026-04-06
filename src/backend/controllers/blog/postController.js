const Post = require('../../models/Post');

// @desc    Obtener todos los posts publicados
// @route   GET /api/blog
// @access  Public
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Obtener un post por ID
// @route   GET /api/blog/:id
// @access  Public
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        }
        // Incrementar vistas
        post.views += 1;
        await post.save();
        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ADMIN ====================

// @desc    Crear post (admin)
// @route   POST /api/admin/blog
// @access  Private/Admin
exports.createPost = async (req, res) => {
    try {
        const postData = {
            ...req.body,
            image: req.body.image || 'placeholder.jpg',
            imageUrl: req.body.imageUrl || '',
            views: 0
        };
        const post = await Post.create(postData);
        res.status(201).json({ success: true, post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Actualizar post (admin)
// @route   PUT /api/admin/blog/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            imageUrl: req.body.imageUrl || ''
        };
        
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!post) {
            return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        }
        res.json({ success: true, post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Eliminar post (admin)
// @route   DELETE /api/admin/blog/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
        }
        
        // Opcional: Eliminar imagen de Cloudinary también
        // if (post.imageUrl && post.imageUrl.includes('cloudinary')) {
        //     const cloudinary = require('cloudinary').v2;
        //     const publicId = post.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        //     await cloudinary.uploader.destroy(publicId);
        // }
        
        res.json({ success: true, message: 'Artículo eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Obtener todos los posts (admin)
// @route   GET /api/admin/blog
// @access  Private/Admin
exports.getAllPostsAdmin = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};