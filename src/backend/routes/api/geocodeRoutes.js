const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');

// @desc    Reverse geocoding usando TomTom
// @route   POST /api/geocode/reverse
// @access  Private
router.post('/reverse', protect, async (req, res) => {
    try {
        const { lat, lng } = req.body;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren latitud y longitud'
            });
        }
        
        const apiKey = process.env.TOMTOM_API_KEY;
        const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${apiKey}&language=es-MX&radius=100`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.addresses && data.addresses[0]) {
            const addr = data.addresses[0].address;
            
            res.json({
                success: true,
                address: {
                    street: addr.streetName || '',
                    streetNumber: addr.streetNumber || '',
                    neighborhood: addr.municipalitySubdivision || addr.neighbourhood || '',
                    city: addr.municipality || addr.city || '',
                    state: addr.countrySubdivision || '',
                    zipCode: addr.extendedPostalCode || addr.postalCode || '',
                    fullAddress: addr.freeformAddress || ''
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No se encontró la dirección'
            });
        }
        
    } catch (error) {
        console.error('Error en reverse geocoding:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la dirección'
        });
    }
});

module.exports = router;