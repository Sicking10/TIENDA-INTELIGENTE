/**
 * Contact Controller - Para manejar mensajes de contacto con Brevo
 */

const { sendContactEmail } = require('../../services/email/emailServiceBrevo');

// @desc    Enviar mensaje de contacto
// @route   POST /api/contact
// @access  Public
exports.sendContactMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Validar campos requeridos
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y mensaje son requeridos'
            });
        }
        
        // Validar email
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }
        
        // Enviar correos usando Brevo
        const result = await sendContactEmail({ name, email, phone, subject, message });
        
        if (result.store.success || result.customer.success) {
            res.json({
                success: true,
                message: 'Mensaje enviado correctamente. Te contactaremos pronto.'
            });
        } else {
            throw new Error('No se pudieron enviar los correos');
        }
        
    } catch (error) {
        console.error('Error al enviar correo de contacto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje. Por favor intenta más tarde.'
        });
    }
};