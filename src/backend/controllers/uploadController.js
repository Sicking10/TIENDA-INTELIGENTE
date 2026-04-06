const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary configurado');

// @desc    Subir imagen a Cloudinary
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

        // Subir a Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `gingercaps/${type}`,
                    transformation: [
                        { quality: 'auto:good' },
                        { fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            
            uploadStream.end(image.data);
        });

        console.log('✅ Imagen subida a Cloudinary:', result.secure_url);
        
        res.json({
            success: true,
            filename: result.public_id,
            url: result.secure_url,
            message: 'Imagen subida correctamente'
        });
        
    } catch (error) {
        console.error('Error al subir imagen a Cloudinary:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al subir la imagen a Cloudinary' 
        });
    }
};

// @desc    Eliminar imagen de Cloudinary
// @route   DELETE /api/upload
// @access  Private/Admin
exports.deleteImage = async (req, res) => {
    try {
        const { filename, type } = req.body;
        
        if (!filename) {
            return res.status(400).json({ success: false, message: 'Nombre de archivo requerido' });
        }
        
        const publicId = filename.startsWith('gingercaps/') ? filename : `gingercaps/${type}/${filename}`;
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            res.json({ success: true, message: 'Imagen eliminada de Cloudinary' });
        } else {
            res.json({ success: false, message: 'No se pudo eliminar la imagen' });
        }
    } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};