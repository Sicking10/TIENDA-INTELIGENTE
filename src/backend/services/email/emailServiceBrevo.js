/**
 * Servicio de correos electrónicos - GINGERcaps
 * Usando API de Brevo (sib-api-v3-sdk)
 */

const SibApiV3Sdk = require('sib-api-v3-sdk');

console.log('📧 [EMAIL SERVICE Brevo API] Inicializando...');

// Configuración
const API_KEY = process.env.BREVO_API_KEY;
const STORE_EMAIL = process.env.STORE_EMAIL || 'atencionalcliente.ginger@gmail.com';
const SENDER_EMAIL = 'atencionalcliente.ginger@gmail.com';
const SENDER_NAME = 'GINGERcaps';

// Inicializar API de Brevo
let apiInstance = null;

function initBrevo() {
    if (!API_KEY) {
        console.error('❌ BREVO_API_KEY no configurada');
        return false;
    }
    
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = API_KEY;
    
    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    console.log('✅ Brevo API inicializada');
    return true;
}

// Escapa HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Formatea dirección
function formatAddress(shipping) {
    if (shipping.method === 'pickup') {
        return `Recoger en tienda: ${shipping.address?.storeName || 'GINGERcaps Boutique'}`;
    }
    const addr = shipping.address;
    if (!addr) return 'Dirección no especificada';
    let address = addr.street || '';
    if (addr.neighborhood) address += `, ${addr.neighborhood}`;
    if (addr.city) address += `, ${addr.city}`;
    if (addr.state) address += `, ${addr.state}`;
    if (addr.zipCode) address += ` CP ${addr.zipCode}`;
    return address;
}

// Genera HTML para correo del cliente
function generateCustomerEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom:1px solid #eee">
            <td style="padding:12px 8px">${escapeHtml(item.name)}${item.concentration ? `<br><small>${escapeHtml(item.concentration)}</small>` : ''}</td>
            <td style="padding:12px 8px;text-align:center">${item.quantity}</td>
            <td style="padding:12px 8px;text-align:right">$${item.price.toFixed(2)}</td>
            <td style="padding:12px 8px;text-align:right">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const subtotal = order.subtotal || 0;
    const shippingCost = order.shippingCost || 0;
    const total = order.total || subtotal + shippingCost;

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Tu pedido GINGERcaps</title>
<style>
body{font-family:Arial,sans-serif;background:#FDF8F0;margin:0;padding:0}
.container{max-width:600px;margin:0 auto;padding:20px;background:#FDF8F0}
.header{text-align:center;padding:20px 0;border-bottom:2px solid #D97A2B}
.logo{font-size:28px;font-weight:700}
.logo span{color:#D97A2B}
.order-number{background:#D97A2B;color:#fff;padding:8px 16px;border-radius:30px;display:inline-block;margin:10px 0}
.status{background:#4CAF50;color:#fff;padding:4px 12px;border-radius:20px;display:inline-block;font-size:12px}
.card{background:#fff;border-radius:16px;padding:20px;margin:20px 0}
.card h3{color:#D97A2B;margin:0 0 15px 0}
table{width:100%;border-collapse:collapse}
th{background:#F5E6D3;padding:10px;text-align:left}
.total-row{font-weight:700;background:#F5E6D3}
.footer{text-align:center;padding:20px;font-size:12px;color:#888;border-top:1px solid #eee;margin-top:20px}
</style>
</head>
<body>
<div class="container">
<div class="header"><div class="logo">GINGER<span>caps</span></div></div>
<div style="text-align:center"><div class="order-number">Pedido #${order.orderNumber}</div><div class="status">Confirmado</div></div>
<p>Hola <strong>${escapeHtml(user.name)}</strong>,<br>¡Gracias por tu compra! Hemos recibido tu pedido.</p>
<div class="card"><h3>📦 Detalles del pedido</h3>
<table>
<thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
<tbody>${itemsHtml}
<tr class="total-row"><td colspan="3">Subtotal:</td><td>$${subtotal.toFixed(2)}</td></tr>
<tr><td colspan="3">Envío:</td><td>${shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)}`}</td></tr>
<tr class="total-row"><td colspan="3">TOTAL:</td><td><strong>$${total.toFixed(2)}</strong></td></tr>
</tbody>
</table></div>
<div class="card"><h3>📍 Envío</h3><p><strong>Método:</strong> ${order.shipping?.method === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}</p>
<p><strong>Dirección:</strong> ${formatAddress(order.shipping)}</p>
<p><strong>Destinatario:</strong> ${order.shipping?.recipientName}</p></div>
<div class="footer"><p>🌿 GINGERcaps - Bienestar Natural</p><p>© ${new Date().getFullYear()} GINGERcaps</p></div>
</div>
</body>
</html>`;
}

// Genera HTML para correo de la tienda
function generateAdminEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding:8px">${escapeHtml(item.name)}${item.concentration ? `<br><small>${escapeHtml(item.concentration)}</small>` : ''}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">$${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    const total = order.total || 0;

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>NUEVO PEDIDO - GINGERcaps</title>
<style>
body{font-family:Arial,sans-serif;background:#FDF8F0}
.container{max-width:700px;margin:0 auto;padding:20px}
.header{background:#D97A2B;color:#fff;padding:20px;text-align:center;border-radius:16px 16px 0 0}
.card{background:#fff;border-radius:12px;padding:20px;margin:20px 0}
table{width:100%;border-collapse:collapse}
th{background:#F5E6D3;padding:10px;text-align:left}
.total-row{background:#F5E6D3;font-weight:700}
.info-row{display:flex;margin:8px 0}
.info-label{width:120px;font-weight:600}
.footer{text-align:center;font-size:12px;color:#888}
</style>
</head>
<body>
<div class="container">
<div class="header"><h2>🛍️ NUEVO PEDIDO</h2></div>
<div class="card"><h3>📋 Cliente</h3>
<div class="info-row"><div class="info-label">Cliente:</div><div>${escapeHtml(user.name)}</div></div>
<div class="info-row"><div class="info-label">Email:</div><div>${escapeHtml(user.email)}</div></div>
<div class="info-row"><div class="info-label">Teléfono:</div><div>${escapeHtml(order.shipping?.phone)}</div></div>
</div>
<div class="card"><h3>📦 Pedido #${order.orderNumber}</h3>
<table>
<thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr></thead>
<tbody>${itemsHtml}
<tr class="total-row"><td colspan="2">TOTAL:</td><td><strong>$${total.toFixed(2)}</strong></td></tr>
</tbody>
</table></div>
<div class="card"><h3>📍 Envío</h3><p>${order.shipping?.method === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}<br>${formatAddress(order.shipping)}</p></div>
<div class="footer"><p>© ${new Date().getFullYear()} GINGERcaps</p></div>
</div>
</body>
</html>`;
}

/**
 * Envía correos usando API de Brevo
 */
async function sendOrderEmails(order, user) {
    console.log('📧 Enviando correos (Brevo API) para pedido:', order?.orderNumber);
    
    if (!apiInstance && !initBrevo()) {
        console.error('❌ Brevo no inicializado');
        return { customer: { success: false }, store: { success: false } };
    }

    const results = { customer: { success: false }, store: { success: false } };

    // Correo al cliente
    if (user?.email) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.subject = `✅ Pedido confirmado #${order.orderNumber}`;
            sendSmtpEmail.to = [{ email: user.email, name: user.name || 'Cliente' }];
            sendSmtpEmail.htmlContent = generateCustomerEmailHTML(order, user);
            sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };

            const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Correo enviado a cliente:', user.email, response.messageId);
            results.customer.success = true;
        } catch (error) {
            console.error('❌ Error correo cliente:', error.message);
        }
    }

    // Correo a la tienda
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = `🛍️ NUEVO PEDIDO #${order.orderNumber}`;
        sendSmtpEmail.to = [{ email: STORE_EMAIL, name: 'Tienda GINGERcaps' }];
        sendSmtpEmail.htmlContent = generateAdminEmailHTML(order, user);
        sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Correo enviado a tienda:', STORE_EMAIL, response.messageId);
        results.store.success = true;
    } catch (error) {
        console.error('❌ Error correo tienda:', error.message);
    }

    return results;
}

/**
 * Envía correo de cancelación
 */
async function sendCancellationEmails(order, user) {
    console.log('📧 Enviando cancelación (Brevo API) para pedido:', order?.orderNumber);
    
    if (!apiInstance && !initBrevo()) {
        return { customer: { success: false }, store: { success: false } };
    }

    const results = { customer: { success: false }, store: { success: false } };

    if (user?.email) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.subject = `❌ Pedido #${order.orderNumber} cancelado`;
            sendSmtpEmail.to = [{ email: user.email, name: user.name || 'Cliente' }];
            sendSmtpEmail.htmlContent = `<h2>Pedido #${order.orderNumber} cancelado</h2><p>Tu pedido ha sido cancelado.</p>`;
            sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };

            await apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Cancelación enviada a cliente:', user.email);
            results.customer.success = true;
        } catch (error) {
            console.error('❌ Error cancelación cliente:', error.message);
        }
    }

    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = `❌ PEDIDO CANCELADO #${order.orderNumber}`;
        sendSmtpEmail.to = [{ email: STORE_EMAIL, name: 'Tienda' }];
        sendSmtpEmail.htmlContent = `<h2>PEDIDO CANCELADO</h2><p>Cliente: ${user?.name}</p><p>Pedido: #${order.orderNumber}</p>`;
        sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Cancelación enviada a tienda');
        results.store.success = true;
    } catch (error) {
        console.error('❌ Error cancelación tienda:', error.message);
    }

    return results;
}

/**
 * Envía correo de cambio de estado
 */
async function sendOrderStatusEmail(order, user, oldStatus, newStatus) {
    console.log('📧 Enviando cambio de estado (Brevo API):', oldStatus, '→', newStatus);
    
    if (!apiInstance && !initBrevo()) {
        return { success: false };
    }

    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = `📦 Pedido #${order.orderNumber} - ${newStatus}`;
        sendSmtpEmail.to = [{ email: user.email, name: user.name || 'Cliente' }];
        sendSmtpEmail.htmlContent = `<h2>Tu pedido #${order.orderNumber} ha sido ${newStatus}</h2><p>${newStatus === 'shipped' ? 'Tu pedido está en camino.' : newStatus === 'delivered' ? 'Tu pedido ha sido entregado.' : ''}</p>`;
        sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Correo de estado enviado');
        return { success: true };
    } catch (error) {
        console.error('❌ Error correo estado:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Envía correo de contacto usando API de Brevo
 */
async function sendContactEmail(formData) {
    console.log('📧 Enviando correo de contacto...');
    
    if (!apiInstance && !initBrevo()) {
        console.error('❌ Brevo no inicializado');
        return { success: false, error: 'Brevo no inicializado' };
    }

    const { name, email, phone, subject, message } = formData;
    
    // Mapear subject a texto legible
    const subjectMap = {
        consulta: 'Consulta general',
        pedido: 'Problema con mi pedido',
        producto: 'Duda sobre producto',
        devolucion: 'Devolución o garantía'
    };
    
    const subjectText = subjectMap[subject] || 'Consulta general';
    
    // Generar HTML para el correo a la tienda
    const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Nuevo mensaje de contacto</title>
<style>
body{font-family:Arial,sans-serif;background:#FDF8F0}
.container{max-width:600px;margin:0 auto;padding:20px}
.header{background:#D97A2B;color:#fff;padding:20px;text-align:center;border-radius:16px 16px 0 0}
.card{background:#fff;border-radius:12px;padding:20px;margin:20px 0}
.info-row{display:flex;margin:10px 0}
.info-label{width:120px;font-weight:600;color:#D97A2B}
.message-box{background:#F5E6D3;padding:15px;border-radius:12px;margin:15px 0}
.footer{text-align:center;font-size:12px;color:#888;margin-top:20px}
</style>
</head>
<body>
<div class="container">
<div class="header"><h2>📬 NUEVO MENSAJE DE CONTACTO</h2></div>
<div class="card">
<h3>📋 Información del cliente</h3>
<div class="info-row"><div class="info-label">Nombre:</div><div>${escapeHtml(name)}</div></div>
<div class="info-row"><div class="info-label">Email:</div><div>${escapeHtml(email)}</div></div>
<div class="info-row"><div class="info-label">Teléfono:</div><div>${escapeHtml(phone || 'No especificado')}</div></div>
<div class="info-row"><div class="info-label">Asunto:</div><div>${escapeHtml(subjectText)}</div></div>
<div class="message-box">
<p><strong>Mensaje:</strong></p>
<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
</div>
</div>
<div class="footer"><p>GINGERcaps - Sistema de contacto</p></div>
</div>
</body>
</html>`;

    // Generar HTML para la confirmación al cliente
    const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Hemos recibido tu mensaje - GINGERcaps</title>
<style>
body{font-family:Arial,sans-serif;background:#FDF8F0}
.container{max-width:600px;margin:0 auto;padding:20px}
.header{background:#D97A2B;color:#fff;padding:20px;text-align:center;border-radius:16px 16px 0 0}
.card{background:#fff;border-radius:12px;padding:20px;margin:20px 0}
.message-box{background:#F5E6D3;padding:15px;border-radius:12px;margin:15px 0}
.footer{text-align:center;font-size:12px;color:#888;margin-top:20px}
.btn{display:inline-block;background:#D97A2B;color:#fff;padding:10px 20px;border-radius:30px;text-decoration:none;margin:10px 0}
</style>
</head>
<body>
<div class="container">
<div class="header"><h2>🌿 ¡Gracias por contactarnos!</h2></div>
<div class="card">
<p>Hola <strong>${escapeHtml(name)}</strong>,</p>
<p>Hemos recibido tu mensaje y nuestro equipo lo revisará a la brevedad. Te responderemos en menos de <strong>24 horas hábiles</strong>.</p>
<p><strong>Detalle de tu mensaje:</strong></p>
<div class="message-box">
<p><strong>Asunto:</strong> ${escapeHtml(subjectText)}</p>
<p><strong>Mensaje:</strong></p>
<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
</div>
<p>Si tienes alguna urgencia, no dudes en llamarnos al <strong>+52 1 669 102 4050</strong>.</p>
</div>
<div class="footer">
<p>🌿 GINGERcaps - Bienestar natural en cada cápsula</p>
<p>Av. del Mar 1235, Zona Dorada, Mazatlán, Sinaloa</p>
</div>
</div>
</body>
</html>`;

    const results = { customer: { success: false }, store: { success: false } };

    // Enviar correo a la tienda
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = `📬 NUEVO CONTACTO: ${subjectText}`;
        sendSmtpEmail.to = [{ email: STORE_EMAIL, name: 'Tienda GINGERcaps' }];
        sendSmtpEmail.htmlContent = adminHtml;
        sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
        sendSmtpEmail.replyTo = { email: email, name: name };

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Correo de contacto enviado a tienda:', STORE_EMAIL, response.messageId);
        results.store.success = true;
    } catch (error) {
        console.error('❌ Error correo contacto tienda:', error.message);
        results.store.error = error.message;
    }

    // Enviar confirmación al cliente
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = `Hemos recibido tu mensaje - GINGERcaps`;
        sendSmtpEmail.to = [{ email: email, name: name }];
        sendSmtpEmail.htmlContent = clientHtml;
        sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Confirmación enviada a cliente:', email, response.messageId);
        results.customer.success = true;
    } catch (error) {
        console.error('❌ Error confirmación cliente:', error.message);
        results.customer.error = error.message;
    }

    return results;
}

// Inicializar
initBrevo();

module.exports = {
    sendOrderEmails,
    sendOrderStatusEmail,
    sendCancellationEmails,
    sendContactEmail 
};