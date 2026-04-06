/**
 * Admin Orders - Gestión de pedidos
 * Soporta: Envío a domicilio y Recoger en tienda
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';
import { formatPrice } from '../../../utils/cartUtils.js';

export default class AdminOrdersView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.orders = [];
    }

    async render() {
        if (!authGuard.isAuthenticated() || !authGuard.hasRole('admin')) {
            window.location.href = '/';
            return;
        }

        await this.loadOrders();

        this.container.innerHTML = `
            <div class="admin-page">
                <div class="admin-container">
                    <div class="admin-header">
                        <div>
                            <h1>Gestionar Pedidos</h1>
                            <p>Administra los pedidos de los clientes</p>
                        </div>
                    </div>

                    <div class="admin-layout">
                        <aside class="admin-sidebar">
                            <nav class="admin-nav">
                                <a href="/admin" class="admin-nav-item" data-link>
                                    <i class="fas fa-chart-line"></i> Dashboard
                                </a>
                                <a href="/admin/productos" class="admin-nav-item" data-link>
                                    <i class="fas fa-box"></i> Productos
                                </a>
                                <a href="/admin/blog" class="admin-nav-item" data-link>
                                    <i class="fas fa-newspaper"></i> Blog
                                </a>
                                <a href="/admin/usuarios" class="admin-nav-item" data-link>
                                    <i class="fas fa-users"></i> Usuarios
                                </a>
                                <a href="/admin/pedidos" class="admin-nav-item active" data-link>
                                    <i class="fas fa-shopping-cart"></i> Pedidos
                                </a>
                            </nav>
                        </aside>

                        <main class="admin-main">
                            <div class="filters-bar">
                                <div class="filters-group">
                                    <span class="filter-label"><i class="fas fa-filter"></i> Filtrar por:</span>
                                    <select id="type-filter" class="filter-select">
                                        <option value="all">📦 Todos los pedidos</option>
                                        <option value="delivery">🚚 Envío a domicilio</option>
                                        <option value="pickup">🏪 Recoger en tienda</option>
                                    </select>
                                    <select id="status-filter" class="filter-select">
                                        <option value="all">📋 Todos los estados</option>
                                        <option value="pending">⏳ Pendientes</option>
                                        <option value="processing">⚙️ Procesando</option>
                                        <option value="shipped">🚚 Enviados</option>
                                        <option value="delivered">✅ Entregados</option>
                                        <option value="ready_for_pickup">🏪 Listos para recoger</option>
                                        <option value="picked_up">🎁 Recogidos</option>
                                        <option value="cancelled">❌ Cancelados</option>
                                    </select>
                                </div>
                            </div>
                            <div class="orders-list">
                                ${this.renderOrdersTable()}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;

        this.initEvents();

        return this;
    }

    async loadOrders() {
        try {
            const token = store.get('auth.token');
            const response = await fetch('/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                this.orders = data.orders || [];
            } else {
                this.orders = [];
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.orders = [];
        }
    }

    isPickup(order) {
        return order.shipping?.method === 'pickup';
    }

    getStatusOptions(order) {
        const isPickup = this.isPickup(order);
        
        if (isPickup) {
            return {
                pending: 'Pendiente',
                processing: 'Procesando',
                ready_for_pickup: 'Listo para recoger',
                picked_up: 'Recogido',
                cancelled: 'Cancelado'
            };
        } else {
            return {
                pending: 'Pendiente',
                processing: 'Procesando',
                shipped: 'Enviado',
                delivered: 'Entregado',
                cancelled: 'Cancelado'
            };
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

    getStatusIcon(status) {
        const iconMap = {
            pending: 'fa-clock',
            processing: 'fa-cog',
            shipped: 'fa-truck',
            delivered: 'fa-check-circle',
            ready_for_pickup: 'fa-store',
            picked_up: 'fa-gift',
            cancelled: 'fa-times-circle'
        };
        return iconMap[status] || 'fa-question-circle';
    }

    renderOrdersTable() {
        if (this.orders.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No hay pedidos</h3>
                    <p>Los pedidos aparecerán aquí cuando los clientes realicen compras.</p>
                </div>
            `;
        }

        const typeFilter = document.getElementById('type-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        
        let filteredOrders = [...this.orders];
        
        if (typeFilter !== 'all') {
            filteredOrders = filteredOrders.filter(o => 
                typeFilter === 'pickup' ? this.isPickup(o) : !this.isPickup(o)
            );
        }
        
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
        }

        if (filteredOrders.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <h3>No hay pedidos con estos filtros</h3>
                    <p>Prueba con otros filtros.</p>
                </div>
            `;
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Tipo</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredOrders.map(order => {
                        const isPickup = this.isPickup(order);
                        const statusOptions = this.getStatusOptions(order);
                        const statusIcon = this.getStatusIcon(order.status);
                        const statusText = this.getStatusText(order.status);
                        
                        return `
                            <tr>
                                <td>#${order.orderNumber}</td>
                                <td>
                                    <span class="type-badge ${isPickup ? 'pickup' : 'delivery'}">
                                        <i class="fas ${isPickup ? 'fa-store' : 'fa-truck'}"></i>
                                        ${isPickup ? 'Recoger en tienda' : 'Envío a domicilio'}
                                    </span>
                                </td>
                                <td>${order.customerName || order.shipping?.recipientName || 'Cliente'}</td>
                                <td>${new Date(order.createdAt).toLocaleDateString('es-MX')}</td>
                                <td>${formatPrice(order.total)}</td>
                                <td>
                                    <span class="status-badge ${order.status}">
                                        <i class="fas ${statusIcon}"></i> ${statusText}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn update-status" data-id="${order._id}" title="Actualizar estado">
                                            <i class="fas fa-save"></i>
                                        </button>
                                        <button class="action-btn view-details" data-id="${order._id}" title="Ver detalles">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    initEvents() {
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                const container = document.querySelector('.orders-list');
                if (container) container.innerHTML = this.renderOrdersTable();
                this.initEvents();
            });
        }

        const filterSelect = document.getElementById('status-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                const container = document.querySelector('.orders-list');
                if (container) container.innerHTML = this.renderOrdersTable();
                this.initEvents();
            });
        }

        document.querySelectorAll('.update-status').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const orderId = btn.dataset.id;
                const row = btn.closest('tr');
                const statusBadge = row.querySelector('.status-badge');
                const currentStatus = statusBadge.classList[1];
                
                // Crear select flotante para cambiar estado
                this.showStatusChangeModal(orderId, currentStatus);
            });
        });

        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const orderId = btn.dataset.id;
                this.showOrderDetails(orderId);
            });
        });
    }

    async showStatusChangeModal(orderId, currentStatus) {
        const order = this.orders.find(o => o._id === orderId);
        if (!order) return;
        
        const isPickup = this.isPickup(order);
        const statusOptions = this.getStatusOptions(order);
        
        const modal = document.createElement('div');
        modal.className = 'admin-modal small';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-exchange-alt"></i> Cambiar estado</h3>
                    <button class="modal-close" data-no-router>&times;</button>
                </div>
                <div class="modal-body">
                    <p class="order-ref">Pedido #${order.orderNumber}</p>
                    <div class="form-group">
                        <label>Seleccionar nuevo estado:</label>
                        <select id="status-change-select" class="status-select">
                            ${Object.entries(statusOptions).map(([value, label]) => `
                                <option value="${value}" ${currentStatus === value ? 'selected' : ''}>${label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button id="confirm-status-change" class="btn-save">Actualizar</button>
                        <button class="btn-cancel">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
        
        const confirmBtn = modal.querySelector('#confirm-status-change');
        confirmBtn.addEventListener('click', async () => {
            const newStatus = modal.querySelector('#status-change-select').value;
            
            try {
                const token = store.get('auth.token');
                const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (response.ok) {
                    showNotification('Estado actualizado correctamente', 'success');
                    closeModal();
                    await this.loadOrders();
                    const container = document.querySelector('.orders-list');
                    if (container) container.innerHTML = this.renderOrdersTable();
                    this.initEvents();
                } else {
                    const error = await response.json();
                    throw new Error(error.message);
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    async showOrderDetails(orderId) {
        try {
            const token = store.get('auth.token');
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const order = data.order;
                const isPickup = this.isPickup(order);
                const statusOptions = this.getStatusOptions(order);
                const statusIcon = this.getStatusIcon(order.status);
                const statusText = this.getStatusText(order.status);
                
                const modal = document.createElement('div');
                modal.className = 'admin-modal order-details-modal';
                modal.innerHTML = `
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="header-info">
                                <i class="fas fa-receipt"></i>
                                <h3>Pedido #${order.orderNumber}</h3>
                                <span class="order-status-badge ${order.status}">
                                    <i class="fas ${statusIcon}"></i> ${statusText}
                                </span>
                            </div>
                            <button class="modal-close" data-no-router>&times;</button>
                        </div>
                        
                        <div class="modal-body">
                            <!-- Cliente Info -->
                            <div class="details-card">
                                <div class="card-header">
                                    <i class="fas fa-user-circle"></i>
                                    <h4>Información del Cliente</h4>
                                </div>
                                <div class="card-content">
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas fa-user"></i> Nombre:</span>
                                        <span class="info-value">${this.escapeHtml(order.shipping?.recipientName || 'N/A')}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas fa-phone"></i> Teléfono:</span>
                                        <span class="info-value">${this.escapeHtml(order.shipping?.phone || 'N/A')}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas ${isPickup ? 'fa-store' : 'fa-truck'}"></i> Tipo:</span>
                                        <span class="info-value type-badge ${isPickup ? 'pickup' : 'delivery'}">
                                            ${isPickup ? '🏪 Recoger en tienda' : '🚚 Envío a domicilio'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Dirección / Tienda -->
                            <div class="details-card">
                                <div class="card-header">
                                    <i class="fas ${isPickup ? 'fa-map-pin' : 'fa-location-dot'}"></i>
                                    <h4>${isPickup ? 'Ubicación de la Tienda' : 'Dirección de Envío'}</h4>
                                </div>
                                <div class="card-content">
                                    ${!isPickup && order.shipping?.address ? `
                                        <div class="address-block">
                                            <i class="fas fa-home"></i>
                                            <div>
                                                <p>${this.escapeHtml(order.shipping.address.street || '')}</p>
                                                <p>${this.escapeHtml(order.shipping.address.city || '')}, ${this.escapeHtml(order.shipping.address.state || '')}</p>
                                                <p>CP ${this.escapeHtml(order.shipping.address.zipCode || '')}</p>
                                            </div>
                                        </div>
                                    ` : ''}
                                    ${isPickup ? `
                                        <div class="address-block pickup-info">
                                            <i class="fas fa-store"></i>
                                            <div>
                                                <p><strong>GINGERcaps Boutique</strong></p>
                                                <p>Av. del Mar 1235, Zona Dorada</p>
                                                <p>Marina Mazatlán, Mazatlán, Sinaloa</p>
                                                <p>Horario: Lun - Sab: 10:00 AM - 8:00 PM</p>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- Productos -->
                            <div class="details-card">
                                <div class="card-header">
                                    <i class="fas fa-boxes"></i>
                                    <h4>Productos</h4>
                                </div>
                                <div class="card-content no-padding">
                                    <div class="products-list">
                                        ${order.items.map(item => `
                                            <div class="product-item">
                                                <div class="product-info">
                                                    <span class="product-name">${this.escapeHtml(item.name)}</span>
                                                    <span class="product-meta">${item.concentration ? `(${item.concentration})` : ''} x${item.quantity}</span>
                                                </div>
                                                <div class="product-price">${formatPrice(item.price * item.quantity)}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="order-total">
                                        <span>Total del pedido</span>
                                        <strong>${formatPrice(order.total)}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Fechas -->
                            <div class="details-card">
                                <div class="card-header">
                                    <i class="fas fa-calendar-alt"></i>
                                    <h4>Fechas importantes</h4>
                                </div>
                                <div class="card-content">
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas fa-calendar-plus"></i> Creado:</span>
                                        <span class="info-value">${new Date(order.createdAt).toLocaleString('es-MX')}</span>
                                    </div>
                                    ${order.shippedAt ? `
                                        <div class="info-row">
                                            <span class="info-label"><i class="fas fa-truck"></i> Enviado:</span>
                                            <span class="info-value">${new Date(order.shippedAt).toLocaleString('es-MX')}</span>
                                        </div>
                                    ` : ''}
                                    ${order.deliveredAt ? `
                                        <div class="info-row">
                                            <span class="info-label"><i class="fas fa-check-circle"></i> Entregado:</span>
                                            <span class="info-value">${new Date(order.deliveredAt).toLocaleString('es-MX')}</span>
                                        </div>
                                    ` : ''}
                                    ${order.readyForPickupAt ? `
                                        <div class="info-row">
                                            <span class="info-label"><i class="fas fa-store"></i> Listo para recoger:</span>
                                            <span class="info-value">${new Date(order.readyForPickupAt).toLocaleString('es-MX')}</span>
                                        </div>
                                    ` : ''}
                                    ${order.pickedUpAt ? `
                                        <div class="info-row">
                                            <span class="info-label"><i class="fas fa-gift"></i> Recogido:</span>
                                            <span class="info-value">${new Date(order.pickedUpAt).toLocaleString('es-MX')}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- Cambiar estado -->
                            <div class="details-card">
                                <div class="card-header">
                                    <i class="fas fa-exchange-alt"></i>
                                    <h4>Cambiar estado del pedido</h4>
                                </div>
                                <div class="card-content">
                                    <select id="detail-status-select" class="status-select">
                                        ${Object.entries(statusOptions).map(([value, label]) => `
                                            <option value="${value}" ${order.status === value ? 'selected' : ''}>${label}</option>
                                        `).join('')}
                                    </select>
                                    <button id="detail-update-status" class="btn-save full-width">
                                        <i class="fas fa-save"></i> Actualizar estado
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                setTimeout(() => modal.classList.add('active'), 10);
                
                const closeModal = () => {
                    modal.classList.remove('active');
                    setTimeout(() => modal.remove(), 300);
                };
                
                modal.querySelector('.modal-close').addEventListener('click', closeModal);
                modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
                
                const updateBtn = modal.querySelector('#detail-update-status');
                const statusSelect = modal.querySelector('#detail-status-select');
                
                updateBtn.addEventListener('click', async () => {
                    const newStatus = statusSelect.value;
                    updateBtn.disabled = true;
                    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
                    
                    try {
                        const token = store.get('auth.token');
                        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: newStatus })
                        });
                        
                        if (response.ok) {
                            showNotification('Estado actualizado correctamente', 'success');
                            closeModal();
                            await this.loadOrders();
                            const container = document.querySelector('.orders-list');
                            if (container) container.innerHTML = this.renderOrdersTable();
                            this.initEvents();
                        } else {
                            const error = await response.json();
                            throw new Error(error.message);
                        }
                    } catch (error) {
                        showNotification(error.message, 'error');
                        updateBtn.disabled = false;
                        updateBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar estado';
                    }
                });
            }
        } catch (error) {
            showNotification('Error al cargar los detalles', 'error');
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

    destroy() {}
}