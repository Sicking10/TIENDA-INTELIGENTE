/**
 * Módulo Mis Pedidos
 * orders.js - Historial completo de pedidos
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { formatPrice } from '../../utils/cartUtils.js';
import { showNotification } from '../notifications/notifications.js';

export default class OrdersView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.currentFilter = 'all';
        this.orders = [];
    }
    
    async render() {
        const isAuthenticated = store.get('auth.isAuthenticated');
        
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        
        this.loadOrdersData();
        
        this.container.innerHTML = `
            <div class="orders-page">
                <div class="orders-hero">
                    <div class="orders-hero-bg">
                        <div class="hero-glow hero-glow-1"></div>
                        <div class="hero-glow hero-glow-2"></div>
                    </div>
                    <div class="container">
                        <div class="orders-hero-content">
                            <div class="hero-icon">
                                <i class="fas fa-shopping-bag"></i>
                            </div>
                            <h1>Mis Pedidos</h1>
                            <p>Historial completo de todas tus compras</p>
                            <div class="orders-stats">
                                <div class="stat">
                                    <span class="stat-number">${this.orders.length}</span>
                                    <span class="stat-label">Total pedidos</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number">${this.getTotalSpent()}</span>
                                    <span class="stat-label">Total gastado</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number">${this.getCompletedOrders()}</span>
                                    <span class="stat-label">Completados</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div class="orders-filters">
                        <button class="filter-btn active" data-filter="all">
                            <i class="fas fa-list"></i> Todos
                        </button>
                        <button class="filter-btn" data-filter="pending">
                            <i class="fas fa-clock"></i> Pendientes
                        </button>
                        <button class="filter-btn" data-filter="processing">
                            <i class="fas fa-cog fa-spin"></i> Procesando
                        </button>
                        <button class="filter-btn" data-filter="shipped">
                            <i class="fas fa-truck"></i> Enviados
                        </button>
                        <button class="filter-btn" data-filter="delivered">
                            <i class="fas fa-check-circle"></i> Entregados
                        </button>
                    </div>
                    
                    <div class="orders-list-container" id="orders-list-container">
                        ${this.renderOrders()}
                    </div>
                </div>
            </div>
        `;
        
        this.initFilters();
        this.initOrderActions();
        
        return this;
    }
    
    loadOrdersData() {
        // Datos de ejemplo - en producción vendrían del backend
        this.orders = [
            {
                id: 'GIN-2024-001',
                date: '15 Marzo, 2024',
                dateObj: new Date(2024, 2, 15),
                total: 349,
                status: 'delivered',
                items: [
                    { id: 1, name: 'GINGERcaps Original', quantity: 1, price: 349, image: 'original', concentration: '500mg' }
                ],
                tracking: {
                    number: 'GIN-001-2024',
                    carrier: 'Estafeta',
                    estimatedDelivery: '20 Marzo, 2024'
                },
                shipping: {
                    address: 'Av. Reforma 123, Ciudad de México, CDMX, 06500',
                    name: 'Juan Pérez',
                    phone: '+52 55 1234 5678'
                }
            },
            {
                id: 'GIN-2024-002',
                date: '10 Febrero, 2024',
                dateObj: new Date(2024, 1, 10),
                total: 449,
                status: 'delivered',
                items: [
                    { id: 2, name: 'GINGERcaps Plus', quantity: 1, price: 449, image: 'plus', concentration: '1000mg' }
                ],
                tracking: {
                    number: 'GIN-002-2024',
                    carrier: 'Estafeta',
                    estimatedDelivery: '15 Febrero, 2024'
                },
                shipping: {
                    address: 'Av. Reforma 123, Ciudad de México, CDMX, 06500',
                    name: 'Juan Pérez',
                    phone: '+52 55 1234 5678'
                }
            },
            {
                id: 'GIN-2024-003',
                date: '5 Enero, 2024',
                dateObj: new Date(2024, 0, 5),
                total: 899,
                status: 'delivered',
                items: [
                    { id: 4, name: 'Kit Detox 30 Días', quantity: 1, price: 899, image: 'kit-detox', concentration: '500mg' }
                ],
                tracking: {
                    number: 'GIN-003-2024',
                    carrier: 'Estafeta',
                    estimatedDelivery: '10 Enero, 2024'
                },
                shipping: {
                    address: 'Av. Reforma 123, Ciudad de México, CDMX, 06500',
                    name: 'Juan Pérez',
                    phone: '+52 55 1234 5678'
                }
            },
            {
                id: 'GIN-2024-004',
                date: '20 Abril, 2024',
                dateObj: new Date(2024, 3, 20),
                total: 549,
                status: 'shipped',
                items: [
                    { id: 3, name: 'GINGERcaps Pro', quantity: 1, price: 549, image: 'pro', concentration: '1500mg' }
                ],
                tracking: {
                    number: 'GIN-004-2024',
                    carrier: 'Estafeta',
                    estimatedDelivery: '25 Abril, 2024'
                },
                shipping: {
                    address: 'Av. Reforma 123, Ciudad de México, CDMX, 06500',
                    name: 'Juan Pérez',
                    phone: '+52 55 1234 5678'
                }
            },
            {
                id: 'GIN-2024-005',
                date: '1 Mayo, 2024',
                dateObj: new Date(2024, 4, 1),
                total: 1199,
                status: 'processing',
                items: [
                    { id: 5, name: 'Kit Rendimiento Máximo', quantity: 1, price: 1199, image: 'kit-performance', concentration: '1000mg' }
                ],
                tracking: null,
                shipping: {
                    address: 'Av. Reforma 123, Ciudad de México, CDMX, 06500',
                    name: 'Juan Pérez',
                    phone: '+52 55 1234 5678'
                }
            }
        ];
    }
    
    getTotalSpent() {
        const total = this.orders.reduce((sum, order) => sum + order.total, 0);
        return formatPrice(total);
    }
    
    getCompletedOrders() {
        return this.orders.filter(o => o.status === 'delivered').length;
    }
    
    renderOrders() {
        const filteredOrders = this.currentFilter === 'all' 
            ? this.orders 
            : this.orders.filter(order => order.status === this.currentFilter);
        
        if (filteredOrders.length === 0) {
            return `
                <div class="empty-orders">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h3>No tienes pedidos ${this.currentFilter !== 'all' ? 'con este estado' : 'aún'}</h3>
                    <p>${this.currentFilter !== 'all' ? 'No encontramos pedidos con este filtro' : 'Realiza tu primera compra y aparecerá aquí'}</p>
                    <a href="/tienda" class="btn-shop" data-link>
                        <i class="fas fa-store"></i> Explorar productos
                    </a>
                </div>
            `;
        }
        
        return `
            <div class="orders-list">
                ${filteredOrders.map(order => this.renderOrderCard(order)).join('')}
            </div>
        `;
    }
    
    renderOrderCard(order) {
        const statusConfig = {
            pending: { icon: 'fa-clock', text: 'Pendiente', class: 'pending', color: '#FF9800' },
            processing: { icon: 'fa-cog fa-spin', text: 'Procesando', class: 'processing', color: '#2196F3' },
            shipped: { icon: 'fa-truck', text: 'Enviado', class: 'shipped', color: '#9C27B0' },
            delivered: { icon: 'fa-check-circle', text: 'Entregado', class: 'delivered', color: '#4CAF50' }
        };
        
        const config = statusConfig[order.status] || statusConfig.pending;
        
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-card-header">
                    <div class="order-info">
                        <span class="order-number">${order.id}</span>
                        <span class="order-date">
                            <i class="far fa-calendar-alt"></i> ${order.date}
                        </span>
                    </div>
                    <div class="order-status ${config.class}">
                        <i class="fas ${config.icon}"></i> ${config.text}
                    </div>
                </div>
                
                <div class="order-card-body">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-image">
                                    <img src="/assets/images/products/${item.image}.jpg" 
                                         alt="${item.name}"
                                         onerror="this.src='/assets/images/products/placeholder.jpg'">
                                </div>
                                <div class="item-details">
                                    <h4>${item.name}</h4>
                                    <p class="item-meta">
                                        <span class="concentration">${item.concentration}</span>
                                        <span class="quantity">Cantidad: ${item.quantity}</span>
                                    </p>
                                </div>
                                <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-card-footer">
                        <div class="order-total">
                            <span>Total:</span>
                            <strong>${formatPrice(order.total)}</strong>
                        </div>
                        <div class="order-actions">
                            ${order.status === 'shipped' ? `
                                <button class="btn-track" data-order-id="${order.id}">
                                    <i class="fas fa-truck"></i> Seguir pedido
                                </button>
                            ` : ''}
                            ${order.status === 'delivered' ? `
                                <button class="btn-reorder" data-order-id="${order.id}">
                                    <i class="fas fa-redo"></i> Comprar de nuevo
                                </button>
                                <button class="btn-review" data-order-id="${order.id}">
                                    <i class="fas fa-star"></i> Reseñar
                                </button>
                            ` : ''}
                            ${order.status === 'processing' ? `
                                <button class="btn-cancel" data-order-id="${order.id}">
                                    <i class="fas fa-times"></i> Cancelar pedido
                                </button>
                            ` : ''}
                            <button class="btn-details" data-order-id="${order.id}">
                                <i class="fas fa-info-circle"></i> Ver detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    initFilters() {
        const filters = document.querySelectorAll('.filter-btn');
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.currentFilter = filter.dataset.filter;
                
                const container = document.getElementById('orders-list-container');
                if (container) {
                    container.innerHTML = this.renderOrders();
                    this.initOrderActions();
                }
            });
        });
    }
    
    initOrderActions() {
        // Seguir pedido
        document.querySelectorAll('.btn-track').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.orderId;
                window.location.href = `/pedido/${orderId}`;
            });
        });
        
        // Comprar de nuevo
        document.querySelectorAll('.btn-reorder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.orderId;
                const order = this.orders.find(o => o.id === orderId);
                if (order) {
                    order.items.forEach(item => {
                        store.addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            concentration: item.concentration
                        });
                    });
                    showNotification('Productos agregados al carrito', 'success');
                    window.location.href = '/carrito';
                }
            });
        });
        
        // Cancelar pedido
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.orderId;
                if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
                    showNotification('Pedido cancelado', 'info');
                    // Aquí iría la llamada a la API para cancelar
                    setTimeout(() => location.reload(), 1500);
                }
            });
        });
        
        // Ver detalles
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.orderId;
                this.showOrderDetails(orderId);
            });
        });
    }
    
    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const modal = document.createElement('div');
        modal.className = 'order-details-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalles del pedido</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="details-section">
                        <h4>Información general</h4>
                        <div class="details-grid">
                            <div><strong>Número de pedido:</strong> ${order.id}</div>
                            <div><strong>Fecha:</strong> ${order.date}</div>
                            <div><strong>Estado:</strong> ${this.getStatusText(order.status)}</div>
                            <div><strong>Total:</strong> ${formatPrice(order.total)}</div>
                        </div>
                    </div>
                    
                    <div class="details-section">
                        <h4>Productos</h4>
                        <div class="details-items">
                            ${order.items.map(item => `
                                <div class="details-item">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>${formatPrice(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="details-section">
                        <h4>Dirección de envío</h4>
                        <p>${order.shipping.address}</p>
                        <p>${order.shipping.name} | ${order.shipping.phone}</p>
                    </div>
                    
                    ${order.tracking ? `
                        <div class="details-section">
                            <h4>Información de seguimiento</h4>
                            <div class="details-grid">
                                <div><strong>Número de guía:</strong> ${order.tracking.number}</div>
                                <div><strong>Paquetería:</strong> ${order.tracking.carrier}</div>
                                <div><strong>Fecha estimada:</strong> ${order.tracking.estimatedDelivery}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
    }
    
    getStatusText(status) {
        const statusMap = {
            pending: 'Pendiente',
            processing: 'Procesando',
            shipped: 'Enviado',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };
        return statusMap[status] || status;
    }
    
    destroy() {}
}