/**
 * Servicio de correos electrónicos - GINGERcaps
 * Optimizado para Render
 */

const nodemailer = require('nodemailer');

console.log('📧 [EMAIL SERVICE] Inicializando...');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('STORE_EMAIL:', process.env.STORE_EMAIL);
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);

// Configuración de email
const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

// Correo de la tienda
const STORE_EMAIL = process.env.STORE_EMAIL || 'atencionalcliente.ginger@gmail.com';

// 🔥 REMITENTE VERIFICADO (el mismo que usas en test-brevo.js)
const SENDER_EMAIL = 'atencionalcliente.ginger@gmail.com';
const SENDER_NAME = 'GINGERcaps';

const TIENDA_UBICACION = {
    nombre: 'GINGERcaps Boutique',
    direccion: 'Av. del Mar 1235, Zona Dorada',
    colonia: 'Marina Mazatlán',
    ciudad: 'Mazatlán',
    estado: 'Sinaloa',
    cp: '82110',
    telefono: '+52 669 123 4567',
    horario: 'Lun - Sab: 10:00 AM - 8:00 PM'
};

// Crear transporter con opciones optimizadas
const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth,
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    debug: false
});

/**
 * Verificar conexión
 */
function verifyConnection() {
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Error de conexión SMTP:', error.message);
        } else {
            console.log('✅ Servicio de correo listo');
        }
    });
}

setTimeout(verifyConnection, 1000);

/**
 * Escapa HTML
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * Formatea la dirección
 */
function formatAddress(shipping) {
    if (shipping.method === 'pickup') {
        return `Recoger en tienda: ${shipping.address?.storeName || TIENDA_UBICACION.nombre}`;
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

/**
 * Genera HTML para el correo del cliente
 */
function generateCustomerEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px;">${escapeHtml(item.name)}${item.concentration ? `<br><small>${escapeHtml(item.concentration)}</small>` : ''}</td>
            <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 12px 8px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
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
@media(max-width:480px){.container{padding:15px}}
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

/**
 * Genera HTML para el correo del administrador
 */
function generateAdminEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr><td style="padding:8px;">${escapeHtml(item.name)}${item.concentration ? `<br><small>${escapeHtml(item.concentration)}</small>` : ''}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">$${item.price.toFixed(2)}</td></tr>
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
.footer{text-align:center;font-size:12px;color:#888;margin-top:20px}
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
 * Envía correos de confirmación
 */
async function sendOrderEmails(order, user) {
    console.log('📧 Enviando correos para pedido:', order?.orderNumber);
    
    const results = { customer: { success: false }, store: { success: false } };

    // 🔥 USAR EL REMITENTE VERIFICADO 🔥
    const fromEmail = `"${SENDER_NAME}" <${SENDER_EMAIL}>`;

    // Correo al cliente
    if (user?.email) {
        try {
            await transporter.sendMail({
                from: fromEmail,
                to: user.email,
                subject: `✅ Pedido confirmado #${order.orderNumber}`,
                html: generateCustomerEmailHTML(order, user)
            });
            console.log('✅ Correo enviado a cliente:', user.email);
            results.customer.success = true;
        } catch (error) {
            console.error('❌ Error correo cliente:', error.message);
        }
    }

    // Correo a la tienda
    try {
        await transporter.sendMail({
            from: fromEmail,
            to: STORE_EMAIL,
            subject: `🛍️ NUEVO PEDIDO #${order.orderNumber}`,
            html: generateAdminEmailHTML(order, user)
        });
        console.log('✅ Correo enviado a tienda:', STORE_EMAIL);
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
    console.log('📧 Enviando cancelación para pedido:', order?.orderNumber);
    
    const fromEmail = `"${SENDER_NAME}" <${SENDER_EMAIL}>`;
    const results = { customer: { success: false }, store: { success: false } };

    if (user?.email) {
        try {
            await transporter.sendMail({
                from: fromEmail,
                to: user.email,
                subject: `❌ Pedido #${order.orderNumber} cancelado`,
                html: `<h2>Pedido #${order.orderNumber} cancelado</h2><p>Tu pedido ha sido cancelado.</p>`
            });
            console.log('✅ Cancelación enviada a cliente:', user.email);
            results.customer.success = true;
        } catch (error) {
            console.error('❌ Error cancelación cliente:', error.message);
        }
    }

    try {
        await transporter.sendMail({
            from: fromEmail,
            to: STORE_EMAIL,
            subject: `❌ PEDIDO CANCELADO #${order.orderNumber}`,
            html: `<h2>PEDIDO CANCELADO</h2><p>Cliente: ${user?.name}</p><p>Pedido: #${order.orderNumber}</p>`
        });
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
    console.log('📧 Enviando cambio de estado:', oldStatus, '→', newStatus);
    
    const fromEmail = `"${SENDER_NAME}" <${SENDER_EMAIL}>`;
    
    try {
        await transporter.sendMail({
            from: fromEmail,
            to: user.email,
            subject: `📦 Pedido #${order.orderNumber} - ${newStatus}`,
            html: `<h2>Tu pedido #${order.orderNumber} ha sido ${newStatus}</h2><p>${newStatus === 'shipped' ? 'Tu pedido está en camino.' : newStatus === 'delivered' ? 'Tu pedido ha sido entregado.' : ''}</p>`
        });
        console.log('✅ Correo de estado enviado');
        return { success: true };
    } catch (error) {
        console.error('❌ Error correo estado:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendOrderEmails,
    sendOrderStatusEmail,
    sendCancellationEmails
};