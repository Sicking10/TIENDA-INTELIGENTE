/**
 * Módulo Mis Pedidos
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { formatPrice } from '../../utils/cartUtils.js';

export default class OrdersView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        const isAuthenticated = store.get('auth.isAuthenticated');
        
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        
        this.container.innerHTML = `
            <div class="orders-page">
                <div class="container">
                    <div class="orders-header">
                        <h1>Mis Pedidos</h1>
                        <p>Historial completo de tus compras</p>
                    </div>
                    
                    <div class="orders-filters">
                        <button class="filter-btn active" data-filter="all">Todos</button>
                        <button class="filter-btn" data-filter="pending">Pendientes</button>
                        <button class="filter-btn" data-filter="shipped">Enviados</button>
                        <button class="filter-btn" data-filter="delivered">Entregados</button>
                    </div>
                    
                    <div class="orders-list" id="orders-list">
                        <div class="empty-orders">
                            <i class="fas fa-shopping-bag"></i>
                            <h3>No tienes pedidos aún</h3>
                            <p>Explora nuestros productos y realiza tu primera compra</p>
                            <a href="/tienda" class="btn-shop-now" data-link>Explorar productos</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initFilters();
        this.loadOrders();
        
        return this;
    }
    
    initFilters() {
        const filters = document.querySelectorAll('.filter-btn');
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.loadOrders(filter.dataset.filter);
            });
        });
    }
    
    async loadOrders(status = 'all') {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;
        
        try {
            const token = store.get('auth.token');
            const response = await fetch(`/api/orders?status=${status}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar pedidos');
            }
            
            const data = await response.json();
            const orders = data.orders || [];
            
            if (orders.length === 0) {
                ordersList.innerHTML = `
                    <div class="empty-orders">
                        <i class="fas fa-shopping-bag"></i>
                        <h3>No hay pedidos</h3>
                        <p>No encontramos pedidos con este filtro</p>
                        <a href="/tienda" class="btn-shop-now" data-link>Explorar productos</a>
                    </div>
                `;
                return;
            }
            
            ordersList.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-info">
                            <span class="order-number">#${order.id || 'GIN-001'}</span>
                            <span class="order-date">${new Date(order.date || Date.now()).toLocaleDateString('es-MX')}</span>
                        </div>
                        <div class="order-status ${order.status || 'pending'}">
                            ${this.getStatusText(order.status)}
                        </div>
                    </div>
                    <div class="order-items">
                        ${this.renderOrderItems(order.items || [])}
                    </div>
                    <div class="order-footer">
                        <div class="order-total">
                            <span>Total:</span>
                            <strong>${formatPrice(order.total || 0)}</strong>
                        </div>
                        <button class="btn-track-order" data-order-id="${order.id}">
                            <i class="fas fa-truck"></i> Seguir pedido
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = `
                <div class="error-orders">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar tus pedidos</p>
                    <button onclick="location.reload()">Reintentar</button>
                </div>
            `;
        }
    }
    
    renderOrderItems(items) {
        if (!items || items.length === 0) {
            return '<div class="order-empty">No hay productos en este pedido</div>';
        }
        
        return items.map(item => `
            <div class="order-item">
                <div class="item-image">
                    <i class="fas fa-capsules"></i>
                </div>
                <div class="item-details">
                    <h4>${item.name || 'GINGERcaps'}</h4>
                    <p>Cantidad: ${item.quantity || 1}</p>
                </div>
                <div class="item-price">${formatPrice(item.price || 0)}</div>
            </div>
        `).join('');
    }
    
    getStatusText(status) {
        const statusMap = {
            pending: 'Pendiente',
            processing: 'Procesando',
            shipped: 'Enviado',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };
        return statusMap[status] || 'Pendiente';
    }
    
    destroy() {}
}