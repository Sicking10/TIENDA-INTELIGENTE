/**
 * Módulo Seguimiento de Pedido
 * orderTracking.js - Seguimiento detallado con datos reales
 * Soporta: Envío a domicilio y Recoger en tienda
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';
import { formatPrice } from '../../../utils/cartUtils.js';

export default class OrderTrackingView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.orderId = params.id;
        this.order = null;
        this.isLoading = true;
    }
    
    async render() {
        if (!authGuard.isAuthenticated()) {
            window.location.href = `/login?redirect=/pedido/${this.orderId}`;
            return;
        }
        
        // Mostrar loading
        this.container.innerHTML = `
            <div class="tracking-page">
                <div class="container" style="text-align: center; padding: 100px 0;">
                    <div class="loading-spinner"></div>
                    <p>Cargando información del pedido...</p>
                </div>
            </div>
        `;
        
        // Cargar datos reales
        await this.loadOrderData();
        
        if (!this.order) {
            this.container.innerHTML = `
                <div class="tracking-page">
                    <div class="container" style="text-align: center; padding: 100px 0;">
                        <div class="empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h2>Pedido no encontrado</h2>
                        <p class="empty-text">No pudimos encontrar el pedido #${this.orderId}</p>
                        <a href="/mis-pedidos" class="btn-shop" data-link>
                            Ver mis pedidos
                        </a>
                    </div>
                </div>
            `;
            return;
        }
        
        this.renderOrderDetails();
        this.initContactSupport();
        
        return this;
    }
    
    async loadOrderData() {
        try {
            const token = store.get('auth.token');
            const response = await fetch(`/api/orders/${this.orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el pedido');
            }

            const data = await response.json();
            this.order = data.order;
            
        } catch (error) {
            console.error('Error loading order:', error);
            this.order = null;
        }
    }
    
    // Determinar si es recoger en tienda o envío a domicilio
    isPickup() {
        return this.order?.shipping?.method === 'pickup';
    }
    
    // Obtener los pasos según el tipo de envío
    getOrderSteps(status) {
        const isPickup = this.isPickup();
        const createdAt = new Date(this.order.createdAt);
        
        if (isPickup) {
            // 🏪 Flujo para recoger en tienda
            const pickupSteps = [
                { name: 'Pedido confirmado', description: 'Hemos recibido tu pedido correctamente' },
                { name: 'Preparando pedido', description: 'Estamos preparando tus cápsulas con mucho cuidado' },
                { name: 'Listo para recoger', description: 'Tu pedido está listo para que pases a recogerlo a la tienda' },
                { name: 'Recogido', description: 'Gracias por recoger tu pedido. ¡Disfruta tus cápsulas!' }
            ];
            
            // Marcar fechas según el estado
            if (status === 'pending') {
                pickupSteps[0].date = createdAt.toLocaleDateString('es-MX');
                return pickupSteps;
            }
            
            if (status === 'processing') {
                pickupSteps[0].date = createdAt.toLocaleDateString('es-MX');
                return pickupSteps;
            }
            
            if (status === 'ready_for_pickup') {
                pickupSteps[0].date = createdAt.toLocaleDateString('es-MX');
                pickupSteps[1].date = new Date(createdAt.getTime() + 86400000).toLocaleDateString('es-MX');
                return pickupSteps;
            }
            
            if (status === 'picked_up') {
                pickupSteps[0].date = createdAt.toLocaleDateString('es-MX');
                pickupSteps[1].date = new Date(createdAt.getTime() + 86400000).toLocaleDateString('es-MX');
                pickupSteps[2].date = new Date(createdAt.getTime() + 172800000).toLocaleDateString('es-MX');
                return pickupSteps;
            }
            
            return pickupSteps;
        } else {
            // 📦 Flujo para envío a domicilio
            const deliverySteps = [
                { name: 'Pedido confirmado', description: 'Hemos recibido tu pedido correctamente' },
                { name: 'Preparando pedido', description: 'Estamos preparando tus cápsulas con mucho cuidado' },
                { name: 'En camino', description: 'Tu pedido ha sido entregado a la paquetería' },
                { name: 'Entregado', description: 'Tu pedido ha sido entregado exitosamente' }
            ];
            
            // Marcar fechas según el estado
            if (status === 'pending') {
                deliverySteps[0].date = createdAt.toLocaleDateString('es-MX');
                return deliverySteps;
            }
            
            if (status === 'processing') {
                deliverySteps[0].date = createdAt.toLocaleDateString('es-MX');
                return deliverySteps;
            }
            
            if (status === 'shipped') {
                deliverySteps[0].date = createdAt.toLocaleDateString('es-MX');
                deliverySteps[1].date = new Date(createdAt.getTime() + 86400000).toLocaleDateString('es-MX');
                return deliverySteps;
            }
            
            if (status === 'delivered') {
                deliverySteps[0].date = createdAt.toLocaleDateString('es-MX');
                deliverySteps[1].date = new Date(createdAt.getTime() + 86400000).toLocaleDateString('es-MX');
                deliverySteps[2].date = new Date(createdAt.getTime() + 172800000).toLocaleDateString('es-MX');
                deliverySteps[3].date = new Date(createdAt.getTime() + 259200000).toLocaleDateString('es-MX');
                return deliverySteps;
            }
            
            return deliverySteps;
        }
    }
    
    getCurrentStepIndex(status) {
        const isPickup = this.isPickup();
        
        if (isPickup) {
            const statusMap = {
                'pending': 0,
                'processing': 1,
                'ready_for_pickup': 2,
                'picked_up': 3,
                'cancelled': 0
            };
            return statusMap[status] || 0;
        } else {
            const statusMap = {
                'pending': 0,
                'processing': 1,
                'shipped': 2,
                'delivered': 3,
                'cancelled': 0
            };
            return statusMap[status] || 0;
        }
    }
    
    getStatusText(status) {
        const statusMap = {
            pending: 'Pendiente',
            processing: 'Procesando',
            shipped: 'Enviado',
            delivered: 'Entregado',
            ready_for_pickup: 'Listo para recoger',
            picked_up: 'Recogido',
            cancelled: 'Cancelado'
        };
        return statusMap[status] || status;
    }
    
    getStatusBadgeClass(status) {
        const classMap = {
            pending: 'pending',
            processing: 'processing',
            shipped: 'shipped',
            delivered: 'delivered',
            ready_for_pickup: 'ready',
            picked_up: 'picked',
            cancelled: 'cancelled'
        };
        return classMap[status] || 'pending';
    }
    
    renderOrderDetails() {
        const isPickup = this.isPickup();
        const steps = this.getOrderSteps(this.order.status);
        const currentStepIndex = this.getCurrentStepIndex(this.order.status);
        
        this.container.innerHTML = `
            <div class="tracking-page">
                <div class="tracking-hero">
                    <div class="tracking-hero-bg">
                        <div class="hero-glow hero-glow-1"></div>
                        <div class="hero-glow hero-glow-2"></div>
                    </div>
                    <div class="container">
                        <div class="tracking-hero-content">
                            <div class="hero-icon">
                                ${isPickup ? '<i class="fas fa-store"></i>' : '<i class="fas fa-truck"></i>'}
                            </div>
                            <h1>${isPickup ? 'Recoger en tienda' : 'Seguimiento de pedido'}</h1>
                            <p class="order-id">Pedido #${this.order.orderNumber}</p>
                            <div class="order-status-badge ${this.getStatusBadgeClass(this.order.status)}">
                                ${this.getStatusText(this.order.status)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div class="tracking-steps-container">
                        <div class="tracking-steps">
                            ${steps.map((step, index) => {
                                let stepClass = '';
                                if (index < currentStepIndex) stepClass = 'completed';
                                else if (index === currentStepIndex) stepClass = 'active';
                                
                                return `
                                    <div class="step ${stepClass}">
                                        <div class="step-marker">
                                            <div class="step-icon">
                                                ${index < currentStepIndex ? '<i class="fas fa-check"></i>' : index + 1}
                                            </div>
                                            <div class="step-line"></div>
                                        </div>
                                        <div class="step-content">
                                            <h4>${step.name}</h4>
                                            <p>${step.description}</p>
                                            ${step.date ? `
                                                <div class="step-date">
                                                    <i class="far fa-calendar-alt"></i> ${step.date}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="tracking-grid">
                        <div class="order-details-card">
                            <h3><i class="fas fa-box"></i> Detalles del pedido</h3>
                            <div class="order-items">
                                ${this.order.items.map(item => `
                                    <div class="order-item">
                                        <div class="item-image">
                                            <img src="/assets/images/products/${item.image || 'placeholder'}" 
                                                 alt="${item.name}"
                                                 onerror="this.src='/assets/images/products/placeholder.jpg'">
                                        </div>
                                        <div class="item-details">
                                            <h4>${item.name}</h4>
                                            <div class="item-meta">
                                                <span class="concentration">${item.concentration || ''}</span>
                                                <span class="quantity">Cantidad: ${item.quantity}</span>
                                            </div>
                                        </div>
                                        <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-total">
                                <span>Total</span>
                                <strong>${formatPrice(this.order.total)}</strong>
                            </div>
                        </div>
                        
                        <div class="shipping-info-card">
                            <h3><i class="fas ${isPickup ? 'fa-store' : 'fa-map-marker-alt'}"></i> ${isPickup ? 'Información de recogida' : 'Información de envío'}</h3>
                            <div class="shipping-details">
                                ${isPickup ? `
                                    <div class="shipping-address">
                                        <i class="fas fa-store"></i>
                                        <div>
                                            <strong>GINGERcaps Boutique</strong>
                                            <p>Av. del Mar 1235, Zona Dorada</p>
                                            <p>Marina Mazatlán, Mazatlán, Sinaloa</p>
                                            <p>Horario: Lun - Sab: 10:00 AM - 8:00 PM</p>
                                        </div>
                                    </div>
                                    <div class="shipping-contact">
                                        <i class="fas fa-phone"></i>
                                        <div>
                                            <strong>Contacto tienda</strong>
                                            <p>+52 1 669 102 4050</p>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="shipping-address">
                                        <i class="fas fa-home"></i>
                                        <div>
                                            <strong>Dirección de entrega</strong>
                                            <p>${this.order.shipping?.address?.street || ''}</p>
                                            <p>${this.order.shipping?.address?.city || ''}, ${this.order.shipping?.address?.state || ''}</p>
                                            <p>CP ${this.order.shipping?.address?.zipCode || ''}</p>
                                        </div>
                                    </div>
                                    <div class="shipping-contact">
                                        <i class="fas fa-user"></i>
                                        <div>
                                            <strong>Destinatario</strong>
                                            <p>${this.order.shipping?.recipientName || 'Cliente'}</p>
                                            <p>${this.order.shipping?.phone || ''}</p>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-support-card">
    <div class="help-support-icon">
        <i class="fas fa-headset"></i>
    </div>
    <div class="help-support-content">
        <h4>¿Necesitas ayuda con tu pedido?</h4>
        <p>Nuestro equipo de soporte está disponible para ayudarte</p>
        <div class="support-contact-grid">
            <div class="support-item">
                <i class="fas fa-phone-alt"></i>
                <div class="support-item-info">
                    <span class="support-label">Teléfono</span>
                    <span class="support-value">+52 1 669 102 4050</span>
                </div>
            </div>
            <div class="support-item">
                <i class="fab fa-whatsapp"></i>
                <div class="support-item-info">
                    <span class="support-label">WhatsApp</span>
                    <span class="support-value">+52 1 669 102 4050</span>
                </div>
            </div>
            <div class="support-item">
                <i class="fas fa-envelope"></i>
                <div class="support-item-info">
                    <span class="support-label">Email</span>
                    <span class="support-value">soporte@gingercaps.com</span>
                </div>
            </div>
            <div class="support-item">
                <i class="fas fa-clock"></i>
                <div class="support-item-info">
                    <span class="support-label">Horario</span>
                    <span class="support-value">Lun - Vie: 10AM - 6PM</span>
                </div>
            </div>
        </div>
    </div>
</div>
                </div>
            </div>
        `;
    }
    
    initContactSupport() {
        const contactBtn = document.getElementById('contact-support');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                showNotification('Próximamente: Soporte en vivo', 'info');
            });
        }
    }
    
    destroy() {}
}