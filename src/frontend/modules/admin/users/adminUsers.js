/**
 * Admin Users - Gestión de usuarios
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';

export default class AdminUsersView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.users = [];
    }

    async render() {
        if (!authGuard.isAuthenticated() || !authGuard.hasRole('admin')) {
            window.location.href = '/';
            return;
        }

        await this.loadUsers();

        this.container.innerHTML = `
            <div class="admin-page">
                <div class="admin-container">
                    <div class="admin-header">
                        <div>
                            <h1><i class="fas fa-users"></i> Gestionar Usuarios</h1>
                            <p>Administra los usuarios registrados</p>
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
                                <a href="/admin/usuarios" class="admin-nav-item active" data-link>
                                    <i class="fas fa-users"></i> Usuarios
                                </a>
                                <a href="/admin/pedidos" class="admin-nav-item" data-link>
                                    <i class="fas fa-shopping-cart"></i> Pedidos
                                </a>
                            </nav>
                        </aside>

                        <main class="admin-main">
                            <div class="users-list">
                                ${this.renderUsersTable()}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;

        this.initEvents();

        return this;
    }

    async loadUsers() {
        try {
            const token = store.get('auth.token');
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                this.users = data.users || [];
                console.log('📦 Usuarios cargados:', this.users);
            } else {
                this.users = [];
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

    renderUsersTable() {
        if (this.users.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No hay usuarios registrados</h3>
                    <p>Los usuarios aparecerán aquí cuando se registren.</p>
                </div>
            `;
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.users.map(user => `
                        <tr data-user-id="${user.id || user._id}">
                            <td>${(user.id || user._id).slice(-6)}</td>
                            <td>${user.name || 'Sin nombre'}</td>
                            <td>${user.email}</td>
                            <td>${user.phone || '-'}</td>
                            <td>
                                <select class="role-select" data-user-id="${user.id || user._id}" data-current-role="${user.role}">
                                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuario</option>
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                                </select>
                            </td>
                            <td>
                                <span class="status-badge ${user.isActive !== false ? 'active' : 'inactive'}">
                                    ${user.isActive !== false ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>${new Date(user.createdAt).toLocaleDateString('es-MX')}</td>
                            <td>
                                <button class="action-btn update-role" data-user-id="${user.id || user._id}" data-current-role="${user.role}" title="Guardar rol">
                                    <i class="fas fa-save"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    initEvents() {
        // Guardar cambio de rol - CORREGIDO
        document.querySelectorAll('.update-role').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                // Obtener el userId del botón
                const userId = btn.dataset.userId;
                console.log('🔑 UserId desde botón:', userId);
                
                if (!userId || userId === 'undefined') {
                    showNotification('Error: ID de usuario inválido', 'error');
                    return;
                }
                
                // Buscar el select correspondiente
                const row = btn.closest('tr');
                const select = row.querySelector('.role-select');
                const newRole = select.value;
                const currentRole = btn.dataset.currentRole;
                
                if (newRole === currentRole) {
                    showNotification('El rol no ha cambiado', 'info');
                    return;
                }
                
                // Deshabilitar botón mientras se procesa
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                try {
                    const token = store.get('auth.token');
                    console.log('📡 Enviando petición a:', `/api/admin/users/${userId}/role`);
                    
                    const response = await fetch(`/api/admin/users/${userId}/role`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ role: newRole })
                    });
                    
                    const data = await response.json();
                    console.log('📡 Respuesta:', data);
                    
                    if (response.ok) {
                        showNotification('Rol actualizado correctamente', 'success');
                        // Actualizar el data-current-role del botón
                        btn.dataset.currentRole = newRole;
                        // Actualizar el select
                        select.setAttribute('data-current-role', newRole);
                    } else {
                        throw new Error(data.message || 'Error al actualizar rol');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification(error.message, 'error');
                    // Restaurar el valor anterior del select
                    select.value = currentRole;
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-save"></i>';
                }
            });
        });
    }

    destroy() {}
}