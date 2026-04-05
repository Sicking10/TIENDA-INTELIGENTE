/**
 * Servicio de correos electrónicos - GINGERcaps
 * Compatible con Render y cualquier hosting
 */

const nodemailer = require('nodemailer');

// Configuración de email (usar variables de entorno)
const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

// Correo de la tienda (quien recibe las notificaciones)
const STORE_EMAIL = process.env.STORE_EMAIL || 'atencionalcliente.ginger@gmail.com';

// 🔥 AGREGAR LA DEFINICIÓN DE TIENDA_UBICACION 🔥
const TIENDA_UBICACION = {
    nombre: 'GINGERcaps Boutique',
    direccion: 'Av. del Mar 1235, Zona Dorada',
    colonia: 'Marina Mazatlán',
    ciudad: 'Mazatlán',
    estado: 'Sinaloa',
    cp: '82110',
    telefono: '+52 669 123 4567',
    horario: 'Lun - Sab: 10:00 AM - 8:00 PM',
    coordenadas: { lat: 23.2428, lng: -106.4206 },
    mapsUrl: 'https://maps.google.com/?q=23.2428,-106.4206'
};

// Crear transporter (reutilizable)
let transporter = null;

/**
 * Inicializa el transporter de nodemailer
 */
function initTransporter() {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
        console.warn('⚠️ Credenciales de email no configuradas. Los correos no se enviarán.');
        return null;
    }

    try {
        transporter = nodemailer.createTransport(EMAIL_CONFIG);
        
        // Verificar conexión
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Error de conexión con servidor de correo:', error);
            } else {
                console.log('✅ Servicio de correo listo');
            }
        });
        
        return transporter;
    } catch (error) {
        console.error('❌ Error al crear transporter:', error);
        return null;
    }
}

/**
 * Formatea el número de teléfono
 */
function formatPhone(phone) {
    if (!phone) return 'No especificado';
    return phone;
}

/**
 * Formatea la dirección para el correo
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
 * Escapa HTML para evitar inyección
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Genera HTML para el correo del cliente
 */
function generateCustomerEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px;">${escapeHtml(item.name)}${item.concentration ? `<br><small style="color:#888;">${escapeHtml(item.concentration)}</small>` : ''}</td>
            <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 12px 8px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const subtotal = order.subtotal || 0;
    const shippingCost = order.shippingCost || 0;
    const total = order.total || subtotal + shippingCost;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tu pedido GINGERcaps</title>
    <style>
        body { font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #FDF8F0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FDF8F0; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #D97A2B; }
        .logo { font-size: 28px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; }
        .logo span { color: #D97A2B; }
        .order-number { background: #D97A2B; color: white; padding: 8px 16px; border-radius: 30px; display: inline-block; font-weight: 600; margin: 10px 0; }
        .greeting { font-size: 18px; margin: 20px 0; color: #2C1A0E; }
        .card { background: white; border-radius: 16px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .card h3 { color: #D97A2B; margin-top: 0; font-size: 18px; border-left: 3px solid #D97A2B; padding-left: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F5E6D3; padding: 10px 8px; text-align: left; font-weight: 600; }
        .total-row { font-weight: 700; background: #F5E6D3; }
        .total-row td { padding: 12px 8px; }
        .shipping-info { background: #F5E6D3; border-radius: 12px; padding: 15px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; margin-top: 20px; }
        .btn { display: inline-block; background: #D97A2B; color: white; padding: 12px 24px; border-radius: 40px; text-decoration: none; margin: 10px 0; }
        .status { display: inline-block; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
        @media (max-width: 480px) {
            .container { padding: 15px; }
            .card { padding: 15px; }
            th, td { font-size: 12px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">GINGER<span>caps</span></div>
            <p style="margin: 5px 0 0; color: #666;">Bienestar Natural</p>
        </div>
        
        <div style="text-align: center;">
            <div class="order-number">Pedido #${order.orderNumber || 'N/A'}</div>
            <div class="status">Confirmado</div>
        </div>
        
        <div class="greeting">
            Hola <strong>${escapeHtml(user.name || 'Cliente')}</strong>,<br>
            ¡Gracias por tu compra en GINGERcaps! Hemos recibido tu pedido y lo estamos procesando.
        </div>
        
        <div class="card">
            <h3>📦 Detalles del pedido</h3>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th style="text-align:center">Cant.</th>
                        <th style="text-align:right">Precio</th>
                        <th style="text-align:right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                        <td colspan="3" style="text-align:right; font-weight:600;">Subtotal:</td>
                        <td style="text-align:right;">$${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align:right;">Envío:</td>
                        <td style="text-align:right;">${shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)}`}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3" style="text-align:right; font-weight:700; font-size:16px;">TOTAL:</td>
                        <td style="text-align:right; font-weight:700; font-size:16px; color:#D97A2B;">$${total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="card">
            <h3>📍 Información de envío</h3>
            <p><strong>Método:</strong> ${order.shipping?.method === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}</p>
            <p><strong>Dirección:</strong> ${formatAddress(order.shipping)}</p>
            <p><strong>Destinatario:</strong> ${order.shipping?.recipientName || 'No especificado'}</p>
            <p><strong>Teléfono:</strong> ${order.shipping?.phone || 'No especificado'}</p>
        </div>
        
        <div class="card">
            <h3>📅 Tiempo de entrega</h3>
            ${order.shipping?.method === 'pickup' ? `
                <p>Tu pedido estará listo para recoger en <strong>2-4 horas hábiles</strong> en nuestra tienda.</p>
                <p>Presenta este correo o tu número de pedido al recoger.</p>
                <p><strong>📍 ${TIENDA_UBICACION.nombre}</strong><br>
                ${TIENDA_UBICACION.direccion}, ${TIENDA_UBICACION.colonia}<br>
                ${TIENDA_UBICACION.ciudad}, ${TIENDA_UBICACION.estado} CP ${TIENDA_UBICACION.cp}</p>
            ` : `
                <p>Tu pedido será entregado en <strong>24-48 horas hábiles</strong> después de la confirmación.</p>
                <p>Recibirás un correo adicional cuando tu pedido esté en camino.</p>
            `}
        </div>
        
        <div class="shipping-info">
            <strong>📞 ¿Necesitas ayuda?</strong><br>
            Contáctanos al <strong>${TIENDA_UBICACION.telefono}</strong> o responde a este correo.<br>
            Horario de atención: ${TIENDA_UBICACION.horario}
        </div>
        
        <div class="footer">
            <p>🌿 GINGERcaps - Bienestar Natural en cada cápsula</p>
            <p>© ${new Date().getFullYear()} GINGERcaps. Todos los derechos reservados.</p>
            <p style="font-size: 10px;">Este es un correo automático, por favor no responder directamente a este mensaje.</p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Genera HTML para el correo del administrador (tienda)
 */
function generateAdminEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px;">${escapeHtml(item.name)}${item.concentration ? `<br><small>${escapeHtml(item.concentration)}</small>` : ''}</td>
            <td style="padding: 10px 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px 8px; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 10px 8px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const subtotal = order.subtotal || 0;
    const shippingCost = order.shippingCost || 0;
    const total = order.total || subtotal + shippingCost;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NUEVO PEDIDO - GINGERcaps</title>
    <style>
        body { font-family: 'Outfit', Arial, sans-serif; margin: 0; padding: 0; background-color: #FDF8F0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #D97A2B; color: white; padding: 20px; text-align: center; border-radius: 16px 16px 0 0; }
        .badge { background: #4CAF50; color: white; padding: 4px 12px; border-radius: 20px; display: inline-block; font-size: 12px; }
        .card { background: white; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F5E6D3; padding: 10px; text-align: left; }
        .total-row { background: #F5E6D3; font-weight: 700; }
        hr { margin: 20px 0; border: none; border-top: 1px solid #eee; }
        .info-row { display: flex; margin: 8px 0; }
        .info-label { width: 120px; font-weight: 600; }
        .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">🛍️ NUEVO PEDIDO</h2>
            <div class="badge">Requiere atención</div>
        </div>
        
        <div class="card">
            <h3>📋 Información del cliente</h3>
            <div class="info-row"><div class="info-label">Cliente:</div><div>${escapeHtml(user.name || 'N/A')}</div></div>
            <div class="info-row"><div class="info-label">Email:</div><div>${escapeHtml(user.email || 'N/A')}</div></div>
            <div class="info-row"><div class="info-label">Teléfono:</div><div>${escapeHtml(order.shipping?.phone || 'N/A')}</div></div>
        </div>
        
        <div class="card">
            <h3>📦 Detalles del pedido</h3>
            <p><strong>Número de pedido:</strong> ${order.orderNumber || 'N/A'}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
            <hr>
            <table>
                <thead>
                    <tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Subtotal</th></tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="total-row"><td colspan="3" style="text-align:right;">Subtotal:</td><td style="text-align:right;">$${subtotal.toFixed(2)}</td></tr>
                    <tr><td colspan="3" style="text-align:right;">Envío:</td><td style="text-align:right;">${shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)}`}</td></tr>
                    <tr class="total-row"><td colspan="3" style="text-align:right; font-size:16px;">TOTAL:</td><td style="text-align:right; font-size:16px; font-weight:700;">$${total.toFixed(2)}</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="card">
            <h3>📍 Envío</h3>
            <p><strong>Método:</strong> ${order.shipping?.method === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}</p>
            <p><strong>Dirección:</strong> ${formatAddress(order.shipping)}</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático del sistema de pedidos de GINGERcaps.</p>
            <p>© ${new Date().getFullYear()} GINGERcaps</p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Envía correo de confirmación al cliente y notificación a la tienda
 * @param {Object} order - Datos del pedido
 * @param {Object} user - Datos del usuario
 * @returns {Promise<Object>} Resultado del envío
 */
async function sendOrderEmails(order, user) {
    if (!transporter) {
        const initialized = initTransporter();
        if (!initialized) {
            console.error('❌ No se pudo inicializar el servicio de correo');
            return { success: false, error: 'Servicio de correo no disponible' };
        }
    }

    const results = {
        customer: { success: false, error: null },
        store: { success: false, error: null }
    };

    // Correo para el cliente
    if (user?.email) {
        try {
            const customerMailOptions = {
                from: `"GINGERcaps" <${EMAIL_CONFIG.auth.user}>`,
                to: user.email,
                subject: `✅ ¡Pedido confirmado! #${order.orderNumber || 'N/A'} - GINGERcaps`,
                html: generateCustomerEmailHTML(order, user)
            };

            const customerInfo = await transporter.sendMail(customerMailOptions);
            console.log(`✅ Correo enviado a cliente: ${user.email}`);
            results.customer.success = true;
        } catch (error) {
            console.error('❌ Error enviando correo al cliente:', error);
            results.customer.error = error.message;
        }
    } else {
        results.customer.error = 'Cliente sin email';
    }

    // Correo para la tienda (siempre se envía)
    try {
        const storeMailOptions = {
            from: `"GINGERcaps Pedidos" <${EMAIL_CONFIG.auth.user}>`,
            to: STORE_EMAIL,
            subject: `🛍️ NUEVO PEDIDO #${order.orderNumber || 'N/A'} - ${user?.name || 'Cliente'}`,
            html: generateAdminEmailHTML(order, user)
        };

        const storeInfo = await transporter.sendMail(storeMailOptions);
        console.log(`✅ Correo enviado a tienda: ${STORE_EMAIL}`);
        results.store.success = true;
    } catch (error) {
        console.error('❌ Error enviando correo a la tienda:', error);
        results.store.error = error.message;
    }

    return results;
}

/**
 * Envía correo de actualización de estado de pedido
 */
async function sendOrderStatusEmail(order, user, oldStatus, newStatus) {
    if (!transporter) initTransporter();
    if (!transporter) return { success: false, error: 'Servicio no disponible' };

    const statusMessages = {
        processing: { emoji: '⚙️', text: 'procesando', message: 'Estamos preparando tu pedido.' },
        shipped: { emoji: '🚚', text: 'enviado', message: 'Tu pedido está en camino.' },
        delivered: { emoji: '✅', text: 'entregado', message: 'Tu pedido ha sido entregado.' },
        cancelled: { emoji: '❌', text: 'cancelado', message: 'Tu pedido ha sido cancelado.' }
    };

    const statusInfo = statusMessages[newStatus] || { emoji: '📦', text: newStatus, message: `Tu pedido ha cambiado a estado: ${newStatus}` };

    const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Actualización de pedido - GINGERcaps</title></head>
        <body style="font-family: Arial, sans-serif; background: #FDF8F0; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px;">
                <div style="text-align: center; font-size: 48px;">${statusInfo.emoji}</div>
                <h2 style="text-align: center; color: #D97A2B;">Pedido #${order.orderNumber}</h2>
                <p style="text-align: center;">Tu pedido ha sido <strong>${statusInfo.text}</strong>.</p>
                <p style="text-align: center;">${statusInfo.message}</p>
                <hr style="margin: 20px 0;">
                <p style="text-align: center; font-size: 12px; color: #888;">GINGERcaps - Bienestar Natural</p>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: `"GINGERcaps" <${EMAIL_CONFIG.auth.user}>`,
            to: user.email,
            subject: `${statusInfo.emoji} Pedido #${order.orderNumber} - ${statusInfo.text}`,
            html
        });
        console.log(`✅ Correo de estado enviado a ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error enviando correo de estado:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Envía correo de cancelación a cliente y tienda
 * @param {Object} order - Datos del pedido
 * @param {Object} user - Datos del usuario
 * @returns {Promise<Object>} Resultado del envío
 */
async function sendCancellationEmails(order, user) {
    if (!transporter) {
        const initialized = initTransporter();
        if (!initialized) {
            console.error('❌ No se pudo inicializar el servicio de correo');
            return { success: false, error: 'Servicio de correo no disponible' };
        }
    }

    const results = {
        customer: { success: false, error: null },
        store: { success: false, error: null }
    };

    // 1. Correo para el CLIENTE (cancelación)
    if (user?.email) {
        try {
            const customerHtml = generateCancellationEmailHTML(order, user);
            const customerMailOptions = {
                from: `"GINGERcaps" <${EMAIL_CONFIG.auth.user}>`,
                to: user.email,
                subject: `❌ Pedido #${order.orderNumber || 'N/A'} cancelado - GINGERcaps`,
                html: customerHtml
            };

            await transporter.sendMail(customerMailOptions);
            console.log(`✅ Correo de cancelación enviado a cliente: ${user.email}`);
            results.customer.success = true;
        } catch (error) {
            console.error('❌ Error enviando correo de cancelación al cliente:', error);
            results.customer.error = error.message;
        }
    } else {
        results.customer.error = 'Cliente sin email';
    }

    // 2. Correo para la TIENDA (cancelación)
    try {
        const storeHtml = generateCancellationStoreEmailHTML(order, user);
        const storeMailOptions = {
            from: `"GINGERcaps Pedidos" <${EMAIL_CONFIG.auth.user}>`,
            to: STORE_EMAIL,
            subject: `❌ PEDIDO CANCELADO #${order.orderNumber || 'N/A'} - ${user?.name || 'Cliente'}`,
            html: storeHtml
        };

        await transporter.sendMail(storeMailOptions);
        console.log(`✅ Correo de cancelación enviado a tienda: ${STORE_EMAIL}`);
        results.store.success = true;
    } catch (error) {
        console.error('❌ Error enviando correo de cancelación a la tienda:', error);
        results.store.error = error.message;
    }

    return results;
}

/**
 * Genera HTML para el correo de cancelación al cliente
 */
function generateCancellationEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px;">${escapeHtml(item.name)}${item.concentration ? `<br><small style="color:#888;">${escapeHtml(item.concentration)}</small>` : ''}</td>
            <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    const subtotal = order.subtotal || 0;
    const shippingCost = order.shippingCost || 0;
    const total = order.total || subtotal + shippingCost;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pedido cancelado - GINGERcaps</title>
    <style>
        body { font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #FDF8F0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FDF8F0; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e74c3c; }
        .logo { font-size: 28px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; }
        .logo span { color: #D97A2B; }
        .order-number { background: #e74c3c; color: white; padding: 8px 16px; border-radius: 30px; display: inline-block; font-weight: 600; margin: 10px 0; }
        .status { display: inline-block; background: #e74c3c; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .greeting { font-size: 18px; margin: 20px 0; color: #2C1A0E; }
        .card { background: white; border-radius: 16px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .card h3 { color: #e74c3c; margin-top: 0; font-size: 18px; border-left: 3px solid #e74c3c; padding-left: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F5E6D3; padding: 10px 8px; text-align: left; font-weight: 600; }
        .total-row { font-weight: 700; background: #F5E6D3; }
        .refund-info { background: #e8f5e9; border-radius: 12px; padding: 15px; margin-top: 15px; border-left: 3px solid #4CAF50; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; margin-top: 20px; }
        hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
        @media (max-width: 480px) {
            .container { padding: 15px; }
            .card { padding: 15px; }
            th, td { font-size: 12px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">GINGER<span>caps</span></div>
            <p style="margin: 5px 0 0; color: #666;">Bienestar Natural</p>
        </div>
        
        <div style="text-align: center;">
            <div class="order-number">Pedido #${order.orderNumber || 'N/A'}</div>
            <div class="status">CANCELADO</div>
        </div>
        
        <div class="greeting">
            Hola <strong>${escapeHtml(user.name || 'Cliente')}</strong>,<br>
            Lamentamos informarte que tu pedido ha sido <strong>cancelado</strong>.
        </div>
        
        <div class="card">
            <h3>📦 Detalles del pedido cancelado</h3>
            <table>
                <thead>
                    <tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                        <td colspan="2" style="text-align:right; font-weight:600;">Total:</td>
                        <td style="text-align:right; font-weight:700;">$${total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="shipping-info">
            <strong>📞 ¿Necesitas ayuda?</strong><br>
            Contáctanos al <strong>${TIENDA_UBICACION.telefono}</strong> o responde a este correo.<br>
            Horario de atención: ${TIENDA_UBICACION.horario}
        </div>
        
        <div class="footer">
            <p>🌿 GINGERcaps - Bienestar Natural en cada cápsula</p>
            <p>© ${new Date().getFullYear()} GINGERcaps. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Genera HTML para el correo de cancelación a la tienda
 */
function generateCancellationStoreEmailHTML(order, user) {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px;">${escapeHtml(item.name)}${item.concentration ? `<br><small>${escapeHtml(item.concentration)}</small>` : ''}</td>
            <td style="padding: 10px 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px 8px; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    const subtotal = order.subtotal || 0;
    const shippingCost = order.shippingCost || 0;
    const total = order.total || subtotal + shippingCost;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PEDIDO CANCELADO - GINGERcaps</title>
    <style>
        body { font-family: 'Outfit', Arial, sans-serif; margin: 0; padding: 0; background-color: #FDF8F0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 16px 16px 0 0; }
        .badge { background: #c0392b; color: white; padding: 4px 12px; border-radius: 20px; display: inline-block; font-size: 12px; }
        .card { background: white; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F5E6D3; padding: 10px; text-align: left; }
        .total-row { background: #F5E6D3; font-weight: 700; }
        hr { margin: 20px 0; border: none; border-top: 1px solid #eee; }
        .info-row { display: flex; margin: 8px 0; }
        .info-label { width: 120px; font-weight: 600; }
        .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
        .warning { background: #fff3e0; padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #ff9800; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">❌ PEDIDO CANCELADO</h2>
            <div class="badge">Revisión requerida</div>
        </div>
        
        <div class="card">
            <h3>📋 Información del cliente</h3>
            <div class="info-row"><div class="info-label">Cliente:</div><div>${escapeHtml(user.name || 'N/A')}</div></div>
            <div class="info-row"><div class="info-label">Email:</div><div>${escapeHtml(user.email || 'N/A')}</div></div>
            <div class="info-row"><div class="info-label">Teléfono:</div><div>${escapeHtml(order.shipping?.phone || 'N/A')}</div></div>
        </div>
        
        <div class="card">
            <h3>📦 Detalles del pedido cancelado</h3>
            <p><strong>Número de pedido:</strong> ${order.orderNumber || 'N/A'}</p>
            <p><strong>Fecha de cancelación:</strong> ${new Date().toLocaleString('es-MX')}</p>
            <hr>
            <table>
                <thead>
                    <tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="total-row"><td colspan="2" style="text-align:right;">TOTAL:</td><td style="text-align:right; font-weight:700;">$${total.toFixed(2)}</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="card">
            <h3>📍 Envío</h3>
            <p><strong>Método:</strong> ${order.shipping?.method === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}</p>
            <p><strong>Dirección:</strong> ${formatAddress(order.shipping)}</p>
        </div>
        
        <div class="warning">
            <strong>⚠️ Acción requerida</strong><br>
            Este pedido ha sido cancelado por el cliente.
        </div>
        
        <div class="footer">
            <p>Este es un correo automático del sistema de pedidos de GINGERcaps.</p>
            <p>© ${new Date().getFullYear()} GINGERcaps</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Inicializar transporter al cargar el módulo
initTransporter();

// Exportar funciones
module.exports = {
    sendOrderEmails,
    sendOrderStatusEmail,
    sendCancellationEmails,
    initTransporter
};