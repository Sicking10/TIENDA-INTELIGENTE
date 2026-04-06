/**
 * Servidor Principal - Tienda Inteligente de Comida
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { protect, authorize } = require('./src/backend/middleware/auth');

const uploadController = require('./src/backend/controllers/uploadController');

// Importar rutas
const authRoutes = require('./src/backend/routes/authRoutes');
const orderRoutes = require('./src/backend/routes/api/orderRoutes');
const geocodeRoutes = require('./src/backend/routes/api/geocodeRoutes');
const userRoutes = require('./src/backend/routes/api/userRoutes');
const adminRoutes = require('./src/backend/routes/api/adminRoutes');
const productRoutes = require('./src/backend/routes/api/productRoutes');
const blogRoutes = require('./src/backend/routes/api/blogRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================

// Seguridad
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            styleSrcElem: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://*.googleapis.com", "https://*.google.com", "https://*.openstreetmap.org"],
            frameSrc: ["'self'", "https://maps.google.com", "https://www.google.com"],
            connectSrc: ["'self'", "https://nominatim.openstreetmap.org"],
            scriptSrcAttr: ["'unsafe-inline'"]
        }
    }
}));

const fileUpload = require('express-fileupload');
app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
    abortOnLimit: true
}));

// Logging
app.use(morgan('dev'));

// CORS
app.use(cors({
    origin: "*",
    credentials: true
}));

// Parseo de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== ARCHIVOS ESTÁTICOS ====================

// Servir archivos estáticos desde public
app.use(express.static(path.join(__dirname, 'public')));

// Servir archivos de src/frontend (para módulos JS)
app.use('/src', express.static(path.join(__dirname, 'src')));

// ==================== CONEXIÓN A MONGODB ====================

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB conectado correctamente');
    console.log(`📁 Base de datos: ${mongoose.connection.name}`);
})
.catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
});

// Escuchar eventos de conexión
mongoose.connection.on('error', (err) => {
    console.error('❌ Error en MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB desconectado');
});

// ==================== RUTAS API ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blog', blogRoutes);

app.post('/api/upload', protect, uploadController.uploadImage);
app.delete('/api/upload', protect, uploadController.deleteImage);

// Ruta base de API
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenido a la API de Tienda Inteligente de Comida',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            }
        }
    });
});

// ==================== RUTA FRONTEND SPA ====================

// Todas las rutas que no sean API van al index.html (SPA)
app.get('*', (req, res, next) => {
    // Si la ruta empieza con /api, pasar al manejador de errores
    if (req.path.startsWith('/api/')) {
        return next();
    }
    // Si es archivo estático (con extensión), dejar que express.static lo maneje
    if (path.extname(req.path)) {
        return next();
    }
    // Enviar index.html para SPA
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== MANEJO DE ERRORES ====================

// Error 404 para rutas API no encontradas
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta API no encontrada: ${req.originalUrl}`
    });
});

// Middleware de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==================== INICIAR SERVIDOR ====================

const server = app.listen(PORT, () => {
    console.log(`
    ═══════════════════════════════════════════════════════
    🚀 Tienda Inteligente de Comida - Servidor iniciado
    ═══════════════════════════════════════════════════════
    📡 URL: http://localhost:${PORT}
    🌍 Entorno: ${process.env.NODE_ENV || 'development'}
    🗄️  MongoDB: ${process.env.MONGODB_URI}
    ═══════════════════════════════════════════════════════
    `);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
        });
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor por SIGTERM...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
        });
    });
});

module.exports = app;