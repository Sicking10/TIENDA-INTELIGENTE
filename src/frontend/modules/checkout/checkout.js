/**
 * Módulo Checkout - Finalizar compra
 * Versión COMPLETA - Envíos solo en Mazatlán, Sinaloa
 * Envío: $50 pesos (GRATIS con 4+ productos)
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, getCartItemCount, calculateCartTotal, updateCartBadge } from '../../utils/cartUtils.js';

// Ubicación de la tienda física
const TIENDA_UBICACION = {
    nombre: 'GINGERcaps Boutique',
    direccion: 'Av. del Mar 1235, Zona Dorada', // Av. Bosques del Arroyo, La Campiña
    colonia: 'Marina Mazatlán', // La Campiña, Calle Bosques del Arroyo
    ciudad: 'Mazatlán',
    estado: 'Sinaloa',
    cp: '82110',
    telefono: '+52 1 669 102 4050',
    horario: 'Lun - Sab: 10:00 AM - 8:00 PM',
    coordenadas: { lat: 23.2428, lng: -106.4206 },
    mapsUrl: 'https://maps.google.com/?q=23.2428,-106.4206'
};

// Costo de envío estándar
const COSTO_ENVIO = 50;
const PRODUCTOS_PARA_ENVIO_GRATIS = 4;

// Zonas de envío en Mazatlán (códigos postales permitidos)
const ZONAS_ENVIO_MAZATLAN = [
    '82000', '82010', '82020', '82030', '82040', '82050', '82060', '82070', '82080', '82090',
    '82100', '82110', '82120', '82130', '82140', '82150', '82160', '82170', '82180', '82190',
    '82200', '82210', '82220', '82230', '82240', '82250', '82260', '82270', '82280', '82290'
];

export default class CheckoutView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.cart = store.get('cart');
        this.user = store.get('auth.user');
    }

    validarDireccionMazatlan(street, city, state, zipCode, country) {
        const errors = [];
        
        if (country && country.toLowerCase().trim() !== 'méxico' && country.toLowerCase().trim() !== 'mexico') {
            errors.push('Solo realizamos envíos dentro de México');
        }
        
        if (state && state.toLowerCase().trim() !== 'sinaloa') {
            errors.push('Solo realizamos envíos dentro de Sinaloa');
        }
        
        if (city && !city.toLowerCase().includes('mazatlán') && !city.toLowerCase().includes('mazatlan')) {
            errors.push('Solo realizamos envíos dentro de Mazatlán, Sinaloa');
        }
        
        if (zipCode) {
            const zip = String(zipCode).trim();
            if (!ZONAS_ENVIO_MAZATLAN.includes(zip)) {
                errors.push('El código postal no corresponde a Mazatlán, Sinaloa');
            }
        } else {
            errors.push('El código postal es requerido');
        }
        
        return errors;
    }

    calcularCostoEnvio() {
        const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'delivery';
        
        if (shippingMethod === 'pickup') {
            return 0;
        }
        
        const cartItems = store.get('cart.items') || [];
        const totalProductos = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalProductos >= PRODUCTOS_PARA_ENVIO_GRATIS) {
            return 0;
        }
        
        return COSTO_ENVIO;
    }

    actualizarResumen() {
        const subtotal = calculateCartTotal();
        const shippingCost = this.calcularCostoEnvio();
        const total = subtotal + shippingCost;
        
        const shippingCostSpan = document.querySelector('.shipping-cost');
        const totalSpan = document.querySelector('.total-amount');
        
        if (shippingCostSpan) {
            if (shippingCost === 0) {
                shippingCostSpan.innerHTML = '<span class="gratis">GRATIS</span>';
            } else {
                shippingCostSpan.textContent = formatPrice(shippingCost);
            }
        }
        if (totalSpan) {
            totalSpan.textContent = formatPrice(total);
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    async render() {
        if (!authGuard.isAuthenticated()) {
            window.location.href = '/login?redirect=/checkout';
            return;
        }

        if (getCartItemCount() === 0) {
            window.location.href = '/carrito';
            showNotification('Tu carrito está vacío', 'warning');
            return;
        }

        const user = this.user || {};
        const subtotal = calculateCartTotal();
        const shippingCost = this.calcularCostoEnvio();
        const total = subtotal + shippingCost;
        const totalProductos = (store.get('cart.items') || []).reduce((sum, item) => sum + item.quantity, 0);
        const envioGratis = totalProductos >= PRODUCTOS_PARA_ENVIO_GRATIS;

        this.container.innerHTML = `
            <div class="checkout-page">
                <div class="container">
                    <div class="checkout-header">
                        <h1>Finalizar compra</h1>
                        <p>Completa tus datos para recibir tu pedido en Mazatlán</p>
                    </div>
                    
                    <div class="checkout-grid">
                        <div class="checkout-form">
                            <div class="form-section">
                                <h3>Información de contacto</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Nombre completo</label>
                                        <input type="text" id="full-name" value="${this.escapeHtml(user.name || '')}" placeholder="Juan Pérez" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" id="email" value="${this.escapeHtml(user.email || '')}" placeholder="juan@email.com" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Teléfono</label>
                                    <input type="tel" id="phone" value="${this.escapeHtml(user.phone || '')}" placeholder="669 123 4567" required>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>Método de entrega</h3>
                                <div class="shipping-methods">
                                    <label class="shipping-option">
                                        <input type="radio" name="shipping" value="delivery" checked>
                                        <i class="fas fa-truck"></i>
                                        <span>Envío a domicilio (Mazatlán) - ${envioGratis ? '<strong class="gratis-text">¡GRATIS!</strong>' : `$${COSTO_ENVIO}`}</span>
                                        ${envioGratis ? '<small class="envio-gratis-badge">✨ Envío gratis por 4+ productos</small>' : ''}
                                    </label>
                                    <label class="shipping-option">
                                        <input type="radio" name="shipping" value="pickup">
                                        <i class="fas fa-store"></i>
                                        <span>Recoger en tienda (Zona Dorada) - <strong>GRATIS</strong></span>
                                    </label>
                                </div>
                                ${!envioGratis && totalProductos > 0 ? `
                                    <div class="envio-info">
                                        <i class="fas fa-info-circle"></i>
                                        <span>¡Agrega ${PRODUCTOS_PARA_ENVIO_GRATIS - totalProductos} producto(s) más y el envío es GRATIS!</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div id="delivery-address" class="form-section">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <h3>Dirección de envío</h3>
                                    <div style="display: flex; gap: 10px;">
                                        <button type="button" id="saved-addresses-btn" class="btn-location" data-no-router>
                                            <i class="fas fa-bookmark"></i> Mis direcciones
                                        </button>
                                        <button type="button" id="use-location-btn" class="btn-location" data-no-router>
                                            <i class="fas fa-location-dot"></i> Usar mi ubicación
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="info-notice">
                                    <i class="fas fa-info-circle"></i>
                                    <div class="info-notice-content">
                                        <strong>📍 Solo realizamos envíos en Mazatlán, Sinaloa</strong>
                                        <p>Por el momento, nuestras entregas están disponibles únicamente en Mazatlán y sus alrededores. Asegúrate de que tu código postal sea válido.</p>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Calle</label>
                                        <input type="text" id="street" placeholder="Av. del Mar" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Número</label>
                                        <input type="text" id="street-number" placeholder="1234">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Colonia</label>
                                        <input type="text" id="neighborhood" placeholder="Marina Mazatlán" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Código Postal</label>
                                        <input type="text" id="zipCode" placeholder="82110" maxlength="5" required>
                                        <small class="form-hint">Códigos postales válidos en Mazatlán</small>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Ciudad</label>
                                        <input type="text" id="city" value="Mazatlán" placeholder="Mazatlán" required>
                                        <small class="form-hint">Actualmente solo disponible Mazatlán</small>
                                    </div>
                                    <div class="form-group">
                                        <label>Estado</label>
                                        <input type="text" id="state" value="Sinaloa" placeholder="Sinaloa" required>
                                        <small class="form-hint">Actualmente solo disponible Sinaloa</small>
                                    </div>
                                </div>
                                <div id="delivery-warning" class="delivery-warning" style="display: none;">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span>Lo sentimos, solo realizamos envíos dentro de Mazatlán, Sinaloa. Por favor verifica tu código postal.</span>
                                </div>
                            </div>
                            
                            <div id="pickup-info" class="form-section pickup-info" style="display: none;">
                                <h3><i class="fas fa-store"></i> Recoge en nuestra tienda</h3>
                                <div class="pickup-card">
                                    <div class="pickup-header">
                                        <div class="pickup-icon">
                                            <i class="fas fa-map-pin"></i>
                                        </div>
                                        <div class="pickup-title">
                                            <h4>${TIENDA_UBICACION.nombre}</h4>
                                            <p>${TIENDA_UBICACION.direccion}</p>
                                        </div>
                                    </div>
                                    <div class="pickup-details">
                                        <div class="pickup-detail">
                                            <i class="fas fa-location-dot"></i>
                                            <span>${TIENDA_UBICACION.colonia}, ${TIENDA_UBICACION.ciudad}, ${TIENDA_UBICACION.estado} CP ${TIENDA_UBICACION.cp}</span>
                                        </div>
                                        <div class="pickup-detail">
                                            <i class="fas fa-clock"></i>
                                            <span>Horario: ${TIENDA_UBICACION.horario}</span>
                                        </div>
                                        <div class="pickup-detail">
                                            <i class="fas fa-phone"></i>
                                            <span>Teléfono: ${TIENDA_UBICACION.telefono}</span>
                                        </div>
                                    </div>
                                    <div class="pickup-note">
                                        <i class="fas fa-info-circle"></i>
                                        <span>Presenta tu número de pedido al recoger. El producto estará listo en 2-4 horas hábiles.</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button id="place-order-btn" class="btn-place-order">
                                <i class="fas fa-check"></i> Confirmar pedido
                            </button>
                        </div>
                        
                        <div class="order-summary">
                            <h3>Resumen del pedido</h3>
                            <div class="summary-items">
                                ${this.renderSummaryItems()}
                            </div>
                            <div class="summary-totals">
                                <div class="summary-row">
                                    <span>Subtotal</span>
                                    <span>${formatPrice(subtotal)}</span>
                                </div>
                                <div class="summary-row">
                                    <span>Envío</span>
                                    <span class="shipping-cost">${shippingCost === 0 ? '<span class="gratis">GRATIS</span>' : formatPrice(shippingCost)}</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total</span>
                                    <span class="total-amount">${formatPrice(total)}</span>
                                </div>
                            </div>
                            <div class="envio-nota">
                                <i class="fas fa-truck"></i>
                                <span>Envío gratis con 4 o más productos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initShippingMethod();
        this.initCheckoutButton();
        this.initLocationButton();
        this.initSavedAddressesButton();
        this.initZipCodeValidation();

        return this;
    }

    renderSummaryItems() {
        const items = store.get('cart.items') || [];
        if (items.length === 0) return '<p>No hay productos</p>';

        return items.map(item => `
            <div class="summary-item">
                <div class="item-info">
                    <span class="item-name">${this.escapeHtml(item.name)}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                </div>
                <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }

    initShippingMethod() {
        const shippingOptions = document.querySelectorAll('input[name="shipping"]');
        const deliverySection = document.getElementById('delivery-address');
        const pickupSection = document.getElementById('pickup-info');
        
        shippingOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                if (e.target.value === 'delivery') {
                    deliverySection.style.display = 'block';
                    pickupSection.style.display = 'none';
                } else {
                    deliverySection.style.display = 'none';
                    pickupSection.style.display = 'block';
                }
                this.actualizarResumen();
            });
        });
    }

    initCheckoutButton() {
        const btn = document.getElementById('place-order-btn');
        if (btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await this.processOrder();
            });
        }
    }

    initLocationButton() {
        const locationBtn = document.getElementById('use-location-btn');
        if (locationBtn) {
            locationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.getUserLocation();
            });
        }
    }

    initSavedAddressesButton() {
        const savedAddressesBtn = document.getElementById('saved-addresses-btn');
        if (savedAddressesBtn) {
            savedAddressesBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await this.showSavedAddresses();
            });
        }
    }

    initZipCodeValidation() {
        const zipInput = document.getElementById('zipCode');
        const warning = document.getElementById('delivery-warning');

        if (zipInput) {
            zipInput.addEventListener('input', (e) => {
                const zip = e.target.value;
                if (zip.length === 5) {
                    if (ZONAS_ENVIO_MAZATLAN.includes(zip)) {
                        warning.style.display = 'none';
                        zipInput.style.borderColor = '#4CAF50';
                    } else {
                        warning.style.display = 'flex';
                        zipInput.style.borderColor = '#F44336';
                        showNotification('Solo realizamos envíos dentro de Mazatlán, Sinaloa', 'warning');
                    }
                } else {
                    warning.style.display = 'none';
                    zipInput.style.borderColor = '';
                }
            });
        }
    }

    getUserLocation() {
        const locationBtn = document.getElementById('use-location-btn');

        if (!navigator.geolocation) {
            showNotification('Tu navegador no soporta geolocalización', 'error');
            return;
        }

        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';
        locationBtn.disabled = true;

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Coordenadas obtenidas:', latitude, longitude);
                await this.reverseGeocode(latitude, longitude);
            },
            (error) => {
                console.error('Error de geolocalización:', error);
                let mensaje = 'No pudimos obtener tu ubicación. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje += 'Por favor permite el acceso a tu ubicación en la configuración del navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje += 'No se pudo detectar tu ubicación. Asegúrate de tener GPS activado.';
                        break;
                    case error.TIMEOUT:
                        mensaje += 'La solicitud de ubicación tardó demasiado. Intenta nuevamente.';
                        break;
                    default:
                        mensaje += 'Intenta nuevamente.';
                }
                showNotification(mensaje, 'error');
                locationBtn.innerHTML = '<i class="fas fa-location-dot"></i> Usar mi ubicación';
                locationBtn.disabled = false;
            },
            options
        );
    }

    async reverseGeocode(lat, lng) {
        const locationBtn = document.getElementById('use-location-btn');
        
        try {
            locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo dirección...';
            locationBtn.disabled = true;
            
            const token = store.get('auth.token');
            
            const response = await fetch('/api/geocode/reverse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ lat, lng })
            });
            
            const data = await response.json();
            
            if (data.success && data.address) {
                const addr = data.address;
                
                document.getElementById('street').value = addr.street;
                document.getElementById('street-number').value = addr.streetNumber;
                document.getElementById('neighborhood').value = addr.neighborhood;
                document.getElementById('zipCode').value = addr.zipCode;
                document.getElementById('city').value = 'Mazatlán';
                document.getElementById('state').value = 'Sinaloa';
                
                showNotification('¡Dirección cargada correctamente!', 'success');
                
                const zipCode = addr.zipCode;
                if (zipCode && ZONAS_ENVIO_MAZATLAN.includes(zipCode)) {
                    const warning = document.getElementById('delivery-warning');
                    if (warning) warning.style.display = 'none';
                } else if (zipCode) {
                    const warning = document.getElementById('delivery-warning');
                    if (warning) warning.style.display = 'flex';
                    showNotification('El código postal no corresponde a Mazatlán', 'warning');
                }
                
            } else {
                showNotification(data.message || 'No se pudo obtener tu dirección', 'error');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al obtener la ubicación', 'error');
        } finally {
            locationBtn.innerHTML = '<i class="fas fa-location-dot"></i> Usar mi ubicación';
            locationBtn.disabled = false;
        }
    }

    async showSavedAddresses() {
        let addresses = [];
        const savedAddresses = localStorage.getItem('user_addresses');
        if (savedAddresses) {
            addresses = JSON.parse(savedAddresses);
        }
        
        if (addresses.length === 0) {
            showNotification('No tienes direcciones guardadas. Ve a Mi Perfil para agregar una.', 'info');
            return;
        }
        
        const mazatlanAddresses = addresses.filter(addr => {
            const errors = this.validarDireccionMazatlan(addr.street, addr.city, addr.state, addr.zipCode, addr.country);
            return errors.length === 0;
        });
        
        if (mazatlanAddresses.length === 0) {
            showNotification('No tienes direcciones guardadas en Mazatlán. Agrega una en Mi Perfil.', 'warning');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-addresses';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-map-marker-alt"></i> Mis direcciones</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="info-notice">
                        <i class="fas fa-info-circle"></i>
                        <div class="info-notice-content">
                            <strong>📍 Solo envíos en Mazatlán, Sinaloa</strong>
                            <p>Actualmente solo realizamos entregas en Mazatlán y sus alrededores. Las direcciones que no estén en esta zona no se mostrarán.</p>
                        </div>
                    </div>
                    
                    <div class="addresses-list-modal">
                        ${mazatlanAddresses.map(addr => `
                            <div class="address-item ${addr.isDefault ? 'default' : ''}">
                                <div class="address-item-header">
                                    <span class="address-type">${addr.isDefault ? '📍 Principal' : 'Dirección'}</span>
                                    ${addr.isDefault ? '<span class="default-badge">Por defecto</span>' : ''}
                                </div>
                                <div class="address-item-content">
                                    <p><strong>${this.escapeHtml(addr.street)}</strong></p>
                                    <p>${this.escapeHtml(addr.neighborhood || '')}</p>
                                    <p>${this.escapeHtml(addr.city)}, ${this.escapeHtml(addr.state)}</p>
                                    <p>CP ${addr.zipCode}</p>
                                </div>
                                <button class="btn-use-address" data-address='${JSON.stringify(addr)}'>
                                    <i class="fas fa-check"></i> Usar esta dirección
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-footer">
                        <a href="/mi-cuenta" class="btn-manage-addresses" data-link>
                            <i class="fas fa-plus"></i> Gestionar direcciones
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        modal.querySelectorAll('.btn-use-address').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const addr = JSON.parse(btn.dataset.address);
                this.fillAddressFromSaved(addr);
                closeModal();
                // ✅ SOLO UNA NOTIFICACIÓN (la de fillAddressFromSaved ya la muestra)
            });
        });
    }

    fillAddressFromSaved(addr) {
        const errors = this.validarDireccionMazatlan(addr.street, addr.city, addr.state, addr.zipCode, addr.country);
        
        if (errors.length > 0) {
            showNotification(errors[0], 'error');
            return;
        }
        
        let street = addr.street;
        let streetNumber = addr.number || '';
        
        if (!streetNumber) {
            const match = addr.street.match(/^(.+?)\s+(\d+)$/);
            if (match) {
                street = match[1];
                streetNumber = match[2];
            }
        }
        
        document.getElementById('street').value = street;
        document.getElementById('street-number').value = streetNumber;
        document.getElementById('neighborhood').value = addr.neighborhood || '';
        document.getElementById('zipCode').value = addr.zipCode;
        document.getElementById('city').value = 'Mazatlán';
        document.getElementById('state').value = 'Sinaloa';
        
        const warning = document.getElementById('delivery-warning');
        if (warning) warning.style.display = 'none';
        
        // ✅ SOLO UNA NOTIFICACIÓN AQUÍ
        showNotification('Dirección cargada correctamente', 'success');
    }

    async processOrder() {
        const fullName = document.getElementById('full-name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();

        if (!fullName || !email || !phone) {
            showNotification('Completa todos los campos de contacto', 'error');
            return;
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            showNotification('Email inválido', 'error');
            return;
        }

        const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'delivery';

        let shippingData = null;
        let shippingCost = 0;

        if (shippingMethod === 'delivery') {
            const street = document.getElementById('street')?.value.trim();
            const streetNumber = document.getElementById('street-number')?.value.trim();
            const neighborhood = document.getElementById('neighborhood')?.value.trim();
            const zipCode = document.getElementById('zipCode')?.value.trim();
            const city = document.getElementById('city')?.value.trim();
            const state = document.getElementById('state')?.value.trim();

            if (!street || !neighborhood || !zipCode || !city || !state) {
                showNotification('Completa la dirección de envío', 'error');
                return;
            }

            const errors = this.validarDireccionMazatlan(
                street + ' ' + streetNumber, 
                city, 
                state, 
                zipCode, 
                'México'
            );
            
            if (errors.length > 0) {
                showNotification(errors[0], 'error');
                return;
            }

            shippingCost = this.calcularCostoEnvio();

            const fullStreet = streetNumber ? `${street} ${streetNumber}` : street;

            shippingData = {
                method: 'delivery',
                address: { street: fullStreet, neighborhood, city, state, zipCode, country: 'México' },
                recipientName: fullName,
                phone: phone
            };
        } else {
            shippingData = {
                method: 'pickup',
                address: { storeName: TIENDA_UBICACION.nombre },
                recipientName: fullName,
                phone: phone
            };
            shippingCost = 0;
        }

        const cartItems = store.get('cart.items') || [];
        const items = cartItems.map(item => ({
            productId: String(item.id),
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            concentration: item.concentration || '',
            image: item.image || 'placeholder'
        }));

        const subtotal = calculateCartTotal();
        const total = subtotal + shippingCost;

        const orderData = {
            items: items,
            subtotal: Number(subtotal),
            discount: 0,
            discountCode: null,
            shippingCost: shippingCost,
            total: Number(total),
            paymentMethod: 'card',
            shipping: shippingData
        };

        const btn = document.getElementById('place-order-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btn.disabled = true;

        try {
            const token = store.get('auth.token');
            if (!token) throw new Error('Sesión expirada');

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al procesar');

            store.clearCart();
            updateCartBadge();
            showNotification('¡Pedido realizado con éxito!', 'success');
            setTimeout(() => window.location.href = `/pedido/${data.order.orderNumber}`, 1500);

        } catch (error) {
            showNotification(error.message, 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    destroy() {}
}