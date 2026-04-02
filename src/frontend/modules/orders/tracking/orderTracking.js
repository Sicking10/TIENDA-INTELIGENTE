/**
 * Módulo Seguimiento de Pedido
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
    }
    
    async render() {
        // Verificar autenticación
        if (!authGuard.isAuthenticated()) {
            window.location.href = `/login?redirect=/pedido/${this.orderId}`;
            return;
        }
        
        this.container.innerHTML = `
            <div class="tracking-page">
                <div class="container">
                    <div class="tracking-header">
                        <h1>Seguimiento de pedido</h1>
                        <p class="order-id">Pedido #${this.orderId || 'GIN-001'}</p>
                    </div>
                    
                    <div class="tracking-steps">
                        <div class="step completed">
                            <div class="step-icon"><i class="fas fa-check"></i></div>
                            <div class="step-info">
                                <h4>Pedido confirmado</h4>
                                <p>Hemos recibido tu pedido</p>
                                <span class="step-date">Hoy, 10:30 AM</span>
                            </div>
                        </div>
                        <div class="step active">
                            <div class="step-icon"><i class="fas fa-box"></i></div>
                            <div class="step-info">
                                <h4>Preparando pedido</h4>
                                <p>Estamos preparando tus cápsulas</p>
                                <span class="step-date">En proceso</span>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-icon"><i class="fas fa-truck"></i></div>
                            <div class="step-info">
                                <h4>En camino</h4>
                                <p>Tu pedido está en ruta</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-icon"><i class="fas fa-home"></i></div>
                            <div class="step-info">
                                <h4>Entregado</h4>
                                <p>Disfruta de tus GINGERcaps</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-details-card">
                        <h3>Detalles del pedido</h3>
                        <div class="order-items" id="order-items">
                            ${this.renderOrderItems()}
                        </div>
                        <div class="order-total">
                            <span>Total</span>
                            <strong>${formatPrice(349)}</strong>
                        </div>
                    </div>
                    
                    <div class="shipping-info">
                        <h3>Información de envío</h3>
                        <p><i class="fas fa-user"></i> Juan Pérez</p>
                        <p><i class="fas fa-map-marker-alt"></i> Calle Principal 123, Colonia Centro, Ciudad de México, CP 12345</p>
                        <p><i class="fas fa-phone"></i> +52 123 456 7890</p>
                    </div>
                    
                    <div class="help-support">
                        <i class="fas fa-headset"></i>
                        <div>
                            <h4>¿Necesitas ayuda?</h4>
                            <p>Contacta a nuestro equipo de soporte</p>
                            <a href="/contacto" class="btn-contact">Contactar soporte</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return this;
    }
    
    renderOrderItems() {
        return `
            <div class="order-item">
                <div class="item-image">
                    <i class="fas fa-capsules"></i>
                </div>
                <div class="item-details">
                    <h4>GINGERcaps Original</h4>
                    <p>Cantidad: 1 frasco (30 cápsulas)</p>
                </div>
                <div class="item-price">${formatPrice(349)}</div>
            </div>
        `;
    }
    
    destroy() {}
}