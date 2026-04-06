const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Obtener token del header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Token no proporcionado.'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // VERIFICAR PRIMERO SI ES EL ADMIN DEL .ENV
        const adminEmail = process.env.ADMIN_EMAIL;
        
        if (decoded.id === 'admin' && decoded.email === adminEmail) {
            // Es el administrador especial del .env
            req.user = {
                id: 'admin',
                email: decoded.email,
                name: process.env.ADMIN_NAME || 'Administrador',
                role: 'admin',
                isActive: true,
                isEnvAdmin: true
            };
            return next();
        }

        // Si no es admin del .env, buscar en la base de datos
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Usuario no encontrado.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Cuenta desactivada.'
            });
        }

        // Adjuntar usuario al request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado.'
            });
        }
        
        console.error('Error en auth middleware:', error);
        res.status(500).json({
            success: false,
            message: 'Error de autenticación.'
        });
    }
};

// Middleware para verificar roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Rol ${req.user.role} no autorizado para esta acción. Roles permitidos: ${roles.join(', ')}`
            });
        }
        next();
    };
};