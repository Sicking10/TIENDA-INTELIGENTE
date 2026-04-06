/**
 * Admin Dashboard - Panel de administración
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';

export default class AdminDashboardView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.stats = {
            totalUsers: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalRevenue: 0
        };
        this.recentOrders = [];
        this.lowStockProducts = [];
    }

    async render() {
        if (!authGuard.isAuthenticated() || !authGuard.hasRole('admin')) {
            window.location.href = '/';
            return;
        }

        await this.loadStats();
        await this.loadRecentOrders();
        await this.loadLowStockProducts();

        this.container.innerHTML = `
            <div class="admin-page">
                <div class="admin-container">
                    <div class="admin-header">
                        <div>
                            <h1>Panel de Administración</h1>
                            <p>Bienvenido, ${store.get('auth.user')?.name || 'Administrador'}</p>
                        </div>
                        <div class="admin-date">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>

                    <div class="admin-layout">
                        <aside class="admin-sidebar">
                            <nav class="admin-nav">
                                <a href="/admin" class="admin-nav-item active" data-link>
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
                                <a href="/admin/pedidos" class="admin-nav-item" data-link>
                                    <i class="fas fa-shopping-cart"></i> Pedidos
                                </a>
                            </nav>
                        </aside>

                        <main class="admin-main">
                            <!-- Stats Cards -->
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <i class="fas fa-users"></i>
                                    <div class="stat-value">${this.stats.totalUsers}</div>
                                    <div class="stat-label">Usuarios Registrados</div>
                                </div>
                                <div class="stat-card">
                                    <i class="fas fa-shopping-cart"></i>
                                    <div class="stat-value">${this.stats.totalOrders}</div>
                                    <div class="stat-label">Pedidos Totales</div>
                                </div>
                                <div class="stat-card">
                                    <i class="fas fa-box"></i>
                                    <div class="stat-value">${this.stats.totalProducts}</div>
                                    <div class="stat-label">Productos</div>
                                </div>
                                <div class="stat-card">
                                    <i class="fas fa-dollar-sign"></i>
                                    <div class="stat-value">$${this.stats.totalRevenue.toLocaleString()}</div>
                                    <div class="stat-label">Ingresos Totales</div>
                                </div>
                            </div>

                            ${this.lowStockProducts.length > 0 ? `
                                <div class="alert alert-warning low-stock-alert">
                                    <div class="alert-icon">
                                        <i class="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div class="alert-content">
                                        <strong>⚠️ Alerta de stock bajo</strong>
                                        <p>${this.lowStockProducts.length} producto(s) tienen menos de 5 unidades. Revisa el inventario.</p>
                                    </div>
                                    <a href="/admin/productos" class="alert-btn" data-link>
                                        Ver productos <i class="fas fa-arrow-right"></i>
                                    </a>
                                </div>
                            ` : ''}

                            <!-- Recent Orders -->
                            <div class="recent-orders-section">
                                <h3 class="recent-orders-title">
                                    <i class="fas fa-clock"></i> Pedidos Recientes
                                </h3>
                                <div class="recent-orders">
                                    ${this.renderRecentOrders()}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;

        return this;
    }

    async loadStats() {
        try {
            const token = store.get('auth.token');
            
            const usersRes = await fetch('/api/admin/users/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                this.stats.totalUsers = usersData.count || 0;
            } else {
                this.stats.totalUsers = 0;
            }

            const ordersRes = await fetch('/api/admin/orders/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                this.stats.totalOrders = ordersData.count || 0;
                this.stats.totalRevenue = ordersData.totalRevenue || 0;
            } else {
                this.stats.totalOrders = 0;
                this.stats.totalRevenue = 0;
            }

            const productsRes = await fetch('/api/admin/products/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (productsRes.ok) {
                const productsData = await productsRes.json();
                this.stats.totalProducts = productsData.count || 0;
            } else {
                const allProductsRes = await fetch('/api/products?limit=1000', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (allProductsRes.ok) {
                    const allProducts = await allProductsRes.json();
                    const products = allProducts.products || allProducts.data || allProducts;
                    this.stats.totalProducts = Array.isArray(products) ? products.length : 0;
                } else {
                    this.stats.totalProducts = 0;
                }
            }

        } catch (error) {
            console.error('Error loading stats:', error);
            this.stats = {
                totalUsers: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalRevenue: 0
            };
        }
    }

    async loadRecentOrders() {
        try {
            const token = store.get('auth.token');
            const response = await fetch('/api/admin/orders/recent', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                this.recentOrders = data.orders || [];
            } else {
                this.recentOrders = [];
            }
        } catch (error) {
            console.error('Error loading recent orders:', error);
            this.recentOrders = [];
        }
    }

    async loadLowStockProducts() {
        try {
            const token = store.get('auth.token');
            const response = await fetch('/api/admin/products/low-stock?threshold=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                this.lowStockProducts = data.products || [];
            }
        } catch (error) {
            console.error('Error loading low stock products:', error);
            this.lowStockProducts = [];
        }
    }

    renderRecentOrders() {
        if (this.recentOrders.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No hay pedidos recientes</h3>
                    <p>Los pedidos aparecerán aquí cuando los clientes realicen compras.</p>
                </div>
            `;
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.recentOrders.map(order => `
                        <tr>
                            <td>#${order.orderNumber}</td>
                            <td>${this.escapeHtml(order.customerName || 'Cliente')}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString('es-MX')}</td>
                            <td>$${order.total.toLocaleString()}</td>
                            <td><span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
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

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    destroy() { }
}