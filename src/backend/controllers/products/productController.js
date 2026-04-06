const Product = require('../../models/Product');

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ADMIN ====================

// @desc    Crear producto (admin)
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            image: req.body.image || 'placeholder.jpg',
            imageUrl: req.body.imageUrl || ''
        };
        const product = await Product.create(productData);
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Actualizar producto (admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            imageUrl: req.body.imageUrl || ''
        };
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Eliminar producto (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        // Opcional: Eliminar imagen de Cloudinary también
        // if (product.imageUrl && product.imageUrl.includes('cloudinary')) {
        //     const cloudinary = require('cloudinary').v2;
        //     const publicId = product.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        //     await cloudinary.uploader.destroy(publicId);
        // }
        
        res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Obtener todos los productos (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};