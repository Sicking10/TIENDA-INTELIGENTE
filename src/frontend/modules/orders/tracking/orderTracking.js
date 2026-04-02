/**
 * Módulo Seguimiento de Pedido
 * orderTracking.js - Seguimiento detallado
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
    }
    
    async render() {
        if (!authGuard.isAuthenticated()) {
            window.location.href = `/login?redirect=/pedido/${this.orderId}`;
            return;
        }
        
        this.loadOrderData();
        
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
                                <i class="fas fa-truck"></i>
                            </div>
                            <h1>Seguimiento de pedido</h1>
                            <p class="order-id">Pedido #${this.orderId}</p>
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div class="tracking-steps-container">
                        <div class="tracking-steps">
                            ${this.renderSteps()}
                        </div>
                    </div>
                    
                    <div class="tracking-grid">
                        <div class="order-details-card">
                            <h3><i class="fas fa-box"></i> Detalles del pedido</h3>
                            <div class="order-items" id="order-items">
                                ${this.renderOrderItems()}
                            </div>
                            <div class="order-total">
                                <span>Total</span>
                                <strong>${formatPrice(349)}</strong>
                            </div>
                        </div>
                        
                        <div class="shipping-info-card">
                            <h3><i class="fas fa-map-marker-alt"></i> Información de envío</h3>
                            <div class="shipping-details">
                                <div class="shipping-address">
                                    <i class="fas fa-home"></i>
                                    <div>
                                        <strong>Dirección de entrega</strong>
                                        <p>Calle Principal 123, Colonia Centro</p>
                                        <p>Ciudad de México, CDMX, CP 12345</p>
                                    </div>
                                </div>
                                <div class="shipping-contact">
                                    <i class="fas fa-user"></i>
                                    <div>
                                        <strong>Destinatario</strong>
                                        <p>Juan Pérez</p>
                                        <p>+52 55 1234 5678</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-support-card">
                        <i class="fas fa-headset"></i>
                        <div>
                            <h4>¿Necesitas ayuda con tu pedido?</h4>
                            <p>Nuestro equipo de soporte está disponible para ayudarte</p>
                            <button class="btn-contact" id="contact-support">
                                Contactar soporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initContactSupport();
        
        return this;
    }
    
    loadOrderData() {
        // Datos de ejemplo - en producción vendrían del backend
        this.order = {
            id: this.orderId,
            status: 'shipped',
            steps: [
                { name: 'Pedido confirmado', completed: true, date: '1 Mayo, 2024', time: '10:30 AM', description: 'Hemos recibido tu pedido correctamente' },
                { name: 'Preparando pedido', completed: true, date: '2 Mayo, 2024', time: '2:15 PM', description: 'Estamos preparando tus cápsulas con mucho cuidado' },
                { name: 'En camino', completed: true, date: '3 Mayo, 2024', time: '9:00 AM', description: 'Tu pedido ha sido entregado a la paquetería' },
                { name: 'Entregado', completed: false, date: null, time: null, description: 'Tu pedido está en ruta hacia tu domicilio' }
            ],
            items: [
                { name: 'GINGERcaps Pro', quantity: 1, price: 549, image: 'pro', concentration: '1500mg' }
            ],
            total: 549,
            tracking: {
                number: 'GIN-004-2024',
                carrier: 'Estafeta',
                estimatedDelivery: '25 Abril, 2024',
                url: 'https://www.estafeta.com/tracking'
            },
            shipping: {
                address: 'Calle Principal 123, Colonia Centro, Ciudad de México, CDMX, CP 12345',
                name: 'Juan Pérez',
                phone: '+52 55 1234 5678'
            }
        };
    }
    
    renderSteps() {
        const steps = this.order.steps;
        let currentStepIndex = steps.findIndex(s => !s.completed);
        if (currentStepIndex === -1) currentStepIndex = steps.length;
        
        return steps.map((step, index) => {
            let stepClass = '';
            if (step.completed) stepClass = 'completed';
            else if (index === currentStepIndex) stepClass = 'active';
            
            return `
                <div class="step ${stepClass}">
                    <div class="step-marker">
                        <div class="step-icon">
                            ${step.completed ? '<i class="fas fa-check"></i>' : index + 1}
                        </div>
                        <div class="step-line"></div>
                    </div>
                    <div class="step-content">
                        <h4>${step.name}</h4>
                        <p>${step.description}</p>
                        ${step.date ? `
                            <div class="step-date">
                                <i class="far fa-calendar-alt"></i> ${step.date}
                                <i class="far fa-clock"></i> ${step.time}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderOrderItems() {
        return this.order.items.map(item => `
            <div class="order-item">
                <div class="item-image">
                    <img src="/assets/images/products/${item.image}.jpg" 
                         alt="${item.name}"
                         onerror="this.src='/assets/images/products/placeholder.jpg'">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-meta">
                        <span class="concentration"><i class="fas fa-weight-hanging"></i> ${item.concentration}</span>
                        <span class="quantity">Cantidad: ${item.quantity}</span>
                    </div>
                </div>
                <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
        `).join('');
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