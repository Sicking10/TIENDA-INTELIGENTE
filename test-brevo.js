// test-brevo.js
require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    console.log('📧 Probando Brevo...');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('User:', process.env.EMAIL_USER);
    
    try {
        const info = await transporter.sendMail({
            from: '"GINGERcaps Test" <atencionalcliente.ginger@gmail.com>', // ← Usa un email verificado
            to: 'atencionalcliente.ginger@gmail.com',
            subject: '🧪 Prueba Brevo - GINGERcaps',
            html: '<h1>✅ Prueba exitosa!</h1><p>Brevo está funcionando correctamente.</p>'
        });
        
        console.log('✅ Correo enviado!');
        console.log('ID:', info.messageId);
        console.log('Respuesta:', info.response);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Detalles:', error);
    }
}

testEmail();