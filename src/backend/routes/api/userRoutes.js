const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');

// @desc    Obtener direcciones del usuario
// @route   GET /api/users/addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
    try {
        const User = require('../../models/User');
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            addresses: user.addresses || []
        });
        
    } catch (error) {
        console.error('Error al obtener direcciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener direcciones'
        });
    }
});

// @desc    Guardar dirección
// @route   POST /api/users/addresses
// @access  Private
router.post('/addresses', protect, async (req, res) => {
    try {
        const User = require('../../models/User');
        const { street, city, state, zipCode, country, isDefault } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const newAddress = {
            id: Date.now(),
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
        };
        
        if (newAddress.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        user.addresses.push(newAddress);
        await user.save();
        
        res.json({
            success: true,
            message: 'Dirección guardada',
            address: newAddress
        });
        
    } catch (error) {
        console.error('Error al guardar dirección:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar dirección'
        });
    }
});

// @desc    Actualizar dirección
// @route   PUT /api/users/addresses/:id
// @access  Private
router.put('/addresses/:id', protect, async (req, res) => {
    try {
        const User = require('../../models/User');
        const { street, city, state, zipCode, country, isDefault } = req.body;
        const addressId = parseInt(req.params.id);
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const addressIndex = user.addresses.findIndex(a => a.id === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Dirección no encontrada'
            });
        }
        
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex],
            street,
            city,
            state,
            zipCode,
            country,
            isDefault
        };
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Dirección actualizada'
        });
        
    } catch (error) {
        console.error('Error al actualizar dirección:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar dirección'
        });
    }
});

// @desc    Eliminar dirección
// @route   DELETE /api/users/addresses/:id
// @access  Private
router.delete('/addresses/:id', protect, async (req, res) => {
    try {
        const User = require('../../models/User');
        const addressId = parseInt(req.params.id);
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        user.addresses = user.addresses.filter(a => a.id !== addressId);
        await user.save();
        
        res.json({
            success: true,
            message: 'Dirección eliminada'
        });
        
    } catch (error) {
        console.error('Error al eliminar dirección:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar dirección'
        });
    }
});

module.exports = router;