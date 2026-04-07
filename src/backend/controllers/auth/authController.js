const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Generar JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Generar código de 6 dígitos
const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Validar errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password, phone } = req.body;

        // Verificar si usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Crear usuario
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        // Generar token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // VERIFICAR PRIMERO SI ES EL ADMIN DEL .ENV
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Administrador';

        if (email === adminEmail && password === adminPassword) {
            // Es el administrador, generar token sin consultar BD
            const token = jwt.sign(
                { 
                    id: 'admin',
                    email: adminEmail,
                    role: 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            return res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: 'admin',
                    name: adminName,
                    email: adminEmail,
                    role: 'admin',
                    isAdmin: true
                }
            });
        }

        // Si no es admin, buscar en la base de datos
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Cuenta desactivada. Contacta al administrador.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil'
        });
    }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren la contraseña actual y la nueva contraseña'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }
        
        const User = require('../../models/User');
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Verificar contraseña actual
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }
        
        // Actualizar contraseña
        user.password = newPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar la contraseña'
        });
    }
};

// ==================== RECUPERAR CONTRASEÑA ====================

// @desc    Solicitar recuperación de contraseña (envía código de 6 dígitos)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'El email es requerido'
            });
        }
        
        // VERIFICAR SI EL EMAIL EXISTE
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Este email no está registrado en nuestra tienda'
            });
        }
        
        // Generar código de 6 dígitos
        const resetCode = generateResetCode();
        const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        
        // Guardar código en el usuario
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetCodeExpires;
        await user.save();
        
        // Enviar correo con el código
        const { sendResetCodeEmail } = require('../../services/email/emailServiceBrevo');
        
        const emailSent = await sendResetCodeEmail(user.email, user.name, resetCode);
        
        if (!emailSent) {
            console.error('Error al enviar correo de recuperación');
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el código. Intenta más tarde.'
            });
        }
        
        res.json({
            success: true,
            message: 'Código de verificación enviado a tu correo electrónico'
        });
        
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
};

// @desc    Verificar código de recuperación
// @route   POST /api/auth/verify-reset-code
// @access  Public
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email y código son requeridos'
            });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido o expirado'
            });
        }
        
        // Verificar código
        if (user.resetPasswordCode !== code) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido'
            });
        }
        
        // Verificar expiración
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'El código ha expirado. Solicita uno nuevo'
            });
        }
        
        // Generar token temporal para restablecer contraseña
        const resetToken = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                purpose: 'password-reset'
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        
        res.json({
            success: true,
            message: 'Código verificado correctamente',
            token: resetToken
        });
        
    } catch (error) {
        console.error('Error en verifyResetCode:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el código'
        });
    }
};

// @desc    Restablecer contraseña
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        
        if (!email || !token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, token y nueva contraseña son requeridos'
            });
        }
        
        // Validar token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado. Solicita un nuevo código'
            });
        }
        
        // Verificar que el token es para restablecer contraseña
        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        // Verificar que el email coincide
        if (decoded.email !== email) {
            return res.status(400).json({
                success: false,
                message: 'Email no coincide con el token'
            });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Validar fortaleza de contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Actualizar contraseña
        user.password = newPassword;
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error al restablecer la contraseña'
        });
    }
};