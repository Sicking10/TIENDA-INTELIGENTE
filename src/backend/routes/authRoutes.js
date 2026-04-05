const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth/authController');
const { protect } = require('../middleware/auth');

// Validaciones
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
        .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('phone')
        .optional()
        .trim()
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Email inválido'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
];

// Rutas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', protect, authController.getMe);

// Cambiar contraseña
router.put('/password', protect, authController.changePassword);

module.exports = router;