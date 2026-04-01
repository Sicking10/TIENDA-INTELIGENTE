/**
 * Módulo Admin Dashboard
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';

export default class AdminDashboardView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        // Verificar rol de admin
        if (!authGuard.hasRole('admin')) {
            window.location.href = '/';
            store.notify('No tienes permisos para acceder a esta página', 'error');
            return;
        }
        
        this.container.innerHTML = `
            <div class="admin-dashboard">
                <div class="admin-sidebar">
                    <div class="admin-logo">
                        <i class="fas fa-leaf"></i>
                        <span>GINGER<span>Admin</span></span>
                    </div>
                    <nav class="admin-nav">
                        <a href="#" class="nav-item active" data-section="dashboard">
                            <i class="fas fa-chart-line"></i> Dashboard
                        </a>
                        <a href="#" class="nav-item" data-section="products">
                            <i class="fas fa-capsules"></i> Productos
                        </a>
                        <a href="#" class="nav-item" data-section="orders">
                            <i class="fas fa-shopping-bag"></i> Pedidos
                        </a>
                        <a href="#" class="nav-item" data-section="users">
                            <i class="fas fa-users"></i> Usuarios
                        </a>
                        <a href="#" class="nav-item" data-section="categories">
                            <i class="fas fa-tags"></i> Categorías
                        </a>
                        <a href="#" class="nav-item" data-section="settings">
                            <i class="fas fa-cog"></i> Configuración
                        </a>
                    </nav>
                </div>
                
                <div class="admin-main">
                    <div class="admin-header">
                        <h1>Panel de Administración</h1>
                        <div class="admin-user">
                            <i class="fas fa-user-circle"></i>
                            <span>Administrador</span>
                        </div>
                    </div>
                    
                    <div id="admin-content" class="admin-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-shopping-bag"></i></div>
                                <div class="stat-info">
                                    <h3>Pedidos hoy</h3>
                                    <p class="stat-number">24</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-users"></i></div>
                                <div class="stat-info">
                                    <h3>Usuarios totales</h3>
                                    <p class="stat-number">1,234</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-capsules"></i></div>
                                <div class="stat-info">
                                    <h3>Productos activos</h3>
                                    <p class="stat-number">12</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                                <div class="stat-info">
                                    <h3>Ventas del mes</h3>
                                    <p class="stat-number">$45,280</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="recent-orders">
                            <h2>Pedidos recientes</h2>
                            <table class="orders-table">
                                <thead>
                                    <tr>
                                        <th>ID Pedido</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#GIN-001</td>
                                        <td>Juan Pérez</td>
                                        <td>$349</td>
                                        <td><span class="status pending">Pendiente</span></td>
                                        <td>Hoy, 10:30 AM</td>
                                    </tr>
                                    <tr>
                                        <td>#GIN-002</td>
                                        <td>María González</td>
                                        <td>$549</td>
                                        <td><span class="status completed">Completado</span></td>
                                        <td>Ayer, 3:15 PM</td>
                                    </tr>
                                    <tr>
                                        <td>#GIN-003</td>
                                        <td>Carlos López</td>
                                        <td>$999</td>
                                        <td><span class="status shipping">Envío</span></td>
                                        <td>Ayer, 11:20 AM</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initNavigation();
        
        return this;
    }
    
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const contentContainer = document.getElementById('admin-content');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                this.loadSection(section, contentContainer);
            });
        });
    }
    
    loadSection(section, container) {
        switch(section) {
            case 'products':
                container.innerHTML = `
                    <div class="products-manager">
                        <h2>Gestión de Productos</h2>
                        <button class="btn-add-product">+ Agregar producto</button>
                        <table class="products-table">
                            <thead>
                                <tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>GINGERcaps Original</td><td>$349</td><td>150</td><td><button>Editar</button></td></tr>
                                <tr><td>GINGERcaps Plus</td><td>$449</td><td>89</td><td><button>Editar</button></td></tr>
                                <tr><td>GINGERcaps Pro</td><td>$549</td><td>45</td><td><button>Editar</button></td></tr>
                            </tbody>
                        </table>
                    </div>
                `;
                break;
            case 'orders':
                container.innerHTML = `
                    <div class="orders-manager">
                        <h2>Gestión de Pedidos</h2>
                        <table class="orders-table">
                            <thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>
                                <tr><td>#GIN-001</td><td>Juan Pérez</td><td>$349</td><td>Pendiente</td><td><button>Actualizar</button></td></tr>
                            </tbody>
                        </table>
                    </div>
                `;
                break;
            case 'users':
                container.innerHTML = `
                    <div class="users-manager">
                        <h2>Gestión de Usuarios</h2>
                        <table class="users-table">
                            <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead>
                            <tbody>
                                <tr><td>Juan Pérez</td><td>juan@email.com</td><td>Usuario</td><td>Activo</td></tr>
                                <tr><td>Admin</td><td>admin@ginger.com</td><td>Admin</td><td>Activo</td></tr>
                            </tbody>
                        </table>
                    </div>
                `;
                break;
            default:
                // Dashboard
                container.innerHTML = `
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-shopping-bag"></i></div><div class="stat-info"><h3>Pedidos hoy</h3><p class="stat-number">24</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-info"><h3>Usuarios totales</h3><p class="stat-number">1,234</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-capsules"></i></div><div class="stat-info"><h3>Productos activos</h3><p class="stat-number">12</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-dollar-sign"></i></div><div class="stat-info"><h3>Ventas del mes</h3><p class="stat-number">$45,280</p></div></div>
                    </div>
                    <div class="recent-orders"><h2>Pedidos recientes</h2><p>Cargando...</p></div>
                `;
        }
    }
    
    destroy() {}
}