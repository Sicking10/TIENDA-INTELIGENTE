const path = require('path');
const fs = require('fs');

// Configurar rutas de subida
const UPLOAD_PATHS = {
    products: 'public/assets/images/products',
    blog: 'public/assets/images/blog'
};

// Asegurar que las carpetas existan
Object.values(UPLOAD_PATHS).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// @desc    Subir imagen
// @route   POST /api/upload
// @access  Private/Admin
exports.uploadImage = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, message: 'No se seleccionó ninguna imagen' });
        }

        const image = req.files.image;
        const type = req.body.type || 'products'; // products o blog

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(image.mimetype)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Formato no soportado. Usa JPG, PNG o WEBP' 
            });
        }

        // Validar tamaño (máximo 2MB)
        if (image.size > 2 * 1024 * 1024) {
            return res.status(400).json({ 
                success: false, 
                message: 'La imagen es demasiado grande. Máximo 2MB' 
            });
        }

        // Generar nombre único
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = path.extname(image.name);
        const filename = `${timestamp}_${random}${extension}`;
        
        // Ruta de destino
        const uploadPath = path.join(__dirname, '../../../', UPLOAD_PATHS[type]);
        const fullPath = path.join(uploadPath, filename);
        
        // Mover archivo
        await image.mv(fullPath);
        
        // URL para acceder a la imagen
        const imageUrl = `/assets/images/${type}/${filename}`;
        
        res.json({
            success: true,
            filename: filename,
            url: imageUrl,
            message: 'Imagen subida correctamente'
        });
        
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al subir la imagen' 
        });
    }
};

// @desc    Eliminar imagen
// @route   DELETE /api/upload
// @access  Private/Admin
exports.deleteImage = async (req, res) => {
    try {
        const { filename, type } = req.body;
        
        if (!filename) {
            return res.status(400).json({ success: false, message: 'Nombre de archivo requerido' });
        }
        
        const uploadPath = path.join(__dirname, '../../../', UPLOAD_PATHS[type || 'products']);
        const filePath = path.join(uploadPath, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json({ success: true, message: 'Imagen eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};