/**
 * Módulo Mis Pedidos
 * orders.js - Historial completo de pedidos
 * Soporta: Envío a domicilio y Recoger en tienda
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { formatPrice } from '../../utils/cartUtils.js';
import { showNotification } from '../notifications/notifications.js';
import { showConfirmModal } from '../../utils/confirmModal.js';

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
                            <p>Cargando tus pedidos...</p>
                            <div class="loading-spinner" style="margin: 20px auto;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadOrdersData();
        this.renderOrdersPage();
        this.initFilters();
        this.initOrderActions();
        this.setupImageErrorHandlers();

        return this;
    }

    renderOrdersPage() {
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
                        <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                            <i class="fas fa-list"></i> Todos
                        </button>
                        <button class="filter-btn ${this.currentFilter === 'pending' ? 'active' : ''}" data-filter="pending">
                            <i class="fas fa-clock"></i> Pendientes
                        </button>
                        <button class="filter-btn ${this.currentFilter === 'processing' ? 'active' : ''}" data-filter="processing">
                            <i class="fas fa-cog"></i> Procesando
                        </button>
                        <!-- 🔥 FILTROS PARA ENVÍO A DOMICILIO -->
                        <button class="filter-btn ${this.currentFilter === 'shipped' ? 'active' : ''}" data-filter="shipped">
                            <i class="fas fa-truck"></i> Enviados
                        </button>
                        <button class="filter-btn ${this.currentFilter === 'delivered' ? 'active' : ''}" data-filter="delivered">
                            <i class="fas fa-check-circle"></i> Entregados
                        </button>
                        <!-- 🔥 FILTROS PARA RECOGER EN TIENDA -->
                        <button class="filter-btn ${this.currentFilter === 'ready_for_pickup' ? 'active' : ''}" data-filter="ready_for_pickup">
                            <i class="fas fa-store"></i> Listos para recoger
                        </button>
                        <button class="filter-btn ${this.currentFilter === 'picked_up' ? 'active' : ''}" data-filter="picked_up">
                            <i class="fas fa-check-double"></i> Recogidos
                        </button>
                    </div>
                    
                    <div class="orders-list-container" id="orders-list-container">
                        ${this.renderOrders()}
                    </div>
                </div>
            </div>
        `;
    }

    setupImageErrorHandlers() {
        document.querySelectorAll('.order-item img').forEach(img => {
            img.addEventListener('error', function() {
                this.src = '/assets/images/products/placeholder.jpg';
            });
        });
    }

    async loadOrdersData() {
        try {
            const token = store.get('auth.token');
            
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar pedidos');
            }

            const data = await response.json();
            
            this.orders = (data.orders || [])
                .filter(order => order.status !== 'cancelled')
                .map(order => ({
                    id: order.orderNumber,
                    _id: order._id,
                    date: new Date(order.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    dateObj: new Date(order.createdAt),
                    total: order.total,
                    status: order.status,
                    items: order.items || [],
                    shippingMethod: order.shipping?.method || 'delivery',
                    tracking: order.shipping?.trackingNumber ? {
                        number: order.shipping.trackingNumber,
                        carrier: order.shipping.carrier,
                        estimatedDelivery: order.shipping.estimatedDelivery
                    } : null,
                    shipping: {
                        address: order.shipping?.address ?
                            `${order.shipping.address.street || ''}, ${order.shipping.address.city || ''}, ${order.shipping.address.state || ''}, ${order.shipping.address.zipCode || ''}` :
                            'Recoger en tienda',
                        name: order.shipping?.recipientName || 'Cliente',
                        phone: order.shipping?.phone || ''
                    }
                }));

        } catch (error) {
            console.error('Error loading orders:', error);
            this.orders = [];
        }
    }

    getTotalSpent() {
        const total = this.orders.reduce((sum, order) => sum + order.total, 0);
        return formatPrice(total);
    }

    getCompletedOrders() {
        // Para delivery: delivered | Para pickup: picked_up
        return this.orders.filter(o => o.status === 'delivered' || o.status === 'picked_up').length;
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
        pending: { icon: 'fa-clock', text: 'Pendiente', class: 'pending' },
        processing: { icon: 'fa-cog', text: 'Procesando', class: 'processing' },
        shipped: { icon: 'fa-truck', text: 'Enviado', class: 'shipped' },
        delivered: { icon: 'fa-check-circle', text: 'Entregado', class: 'delivered' },
        ready_for_pickup: { icon: 'fa-store', text: 'Listo para recoger', class: 'ready' },
        picked_up: { icon: 'fa-check-double', text: 'Recogido', class: 'picked' }
    };

    const config = statusConfig[order.status] || statusConfig.pending;
    const isPickup = order.shippingMethod === 'pickup';

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
                                <img src="${item.imageUrl || `/assets/images/products/${item.image || 'placeholder'}`}" 
                                     alt="${item.name}"
                                     class="order-item-img"
                                     loading="lazy"
                                     onerror="this.src='/assets/images/products/placeholder.jpg'">
                            </div>
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p class="item-meta">
                                    <span class="concentration">${item.concentration || ''}</span>
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
                        ${order.status === 'ready_for_pickup' ? `
                            <button class="btn-pickup" data-order-id="${order.id}">
                                <i class="fas fa-store"></i> Ver tienda
                            </button>
                        ` : ''}
                        ${order.status === 'delivered' || order.status === 'picked_up' ? `
                            <button class="btn-reorder" data-order-id="${order.id}">
                                <i class="fas fa-redo"></i> Comprar de nuevo
                            </button>
                        ` : ''}
                        ${order.status === 'pending' || order.status === 'processing' ? `
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
                    this.setupImageErrorHandlers();
                }
            });
        });
    }

    initOrderActions() {
        // Seguir pedido (delivery)
        document.querySelectorAll('.btn-track').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.orderId;
                window.location.href = `/pedido/${orderId}`;
            });
        });

        // Ver tienda (pickup)
        document.querySelectorAll('.btn-pickup').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Mostrar información de la tienda o redirigir
                window.open('https://maps.google.com/?q=23.2428,-106.4206', '_blank');
            });
        });

        // Ver detalles
        document.querySelectorAll('.btn-details').forEach(btn => {
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
                if (order && order.items) {
                    order.items.forEach(item => {
                        store.addToCart({
                            id: item.productId || item.id,
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
            btn.addEventListener('click', async (e) => {
                const orderNumber = btn.dataset.orderId;

                const confirmed = await showConfirmModal({
                    title: 'Cancelar pedido de la tienda',
                    message: '¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.',
                    confirmText: 'Sí, cancelar',
                    cancelText: 'No, regresar'
                });

                if (!confirmed) return;

                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelando...';
                
                try {
                    const token = store.get('auth.token');
                    const response = await fetch(`/api/orders/${orderNumber}/cancel`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        showNotification('Pedido cancelado exitosamente', 'success');
                        await this.loadOrdersData();
                        this.renderOrdersPage();
                        this.initFilters();
                        this.initOrderActions();
                        this.setupImageErrorHandlers();
                    } else {
                        const error = await response.json();
                        throw new Error(error.message || 'Error al cancelar');
                    }
                } catch (error) {
                    showNotification(error.message, 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-times"></i> Cancelar pedido';
                }
            });
        });
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

    destroy() { }
}