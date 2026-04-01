/**
 * Módulo Perfil de Usuario
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';

export default class ProfileView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.user = store.get('auth.user');
        this.isAuthenticated = store.get('auth.isAuthenticated');
    }
    
    async render() {
        // Verificar autenticación
        if (!this.isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        
        this.container.innerHTML = `
            <div class="profile-page">
                <div class="container">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="profile-info">
                            <h1>${this.user?.name || 'Usuario'}</h1>
                            <p>${this.user?.email || ''}</p>
                            <span class="profile-badge">Miembro desde ${this.getMemberSince()}</span>
                        </div>
                    </div>
                    
                    <div class="profile-tabs">
                        <button class="tab-btn active" data-tab="personal">Información Personal</button>
                        <button class="tab-btn" data-tab="pedidos">Mis Pedidos</button>
                        <button class="tab-btn" data-tab="direcciones">Direcciones</button>
                        <button class="tab-btn" data-tab="seguridad">Seguridad</button>
                    </div>
                    
                    <div class="profile-content">
                        <!-- Tab Personal -->
                        <div class="tab-pane active" id="tab-personal">
                            <div class="profile-card">
                                <h3>Información Personal</h3>
                                <form id="profile-form" class="profile-form">
                                    <div class="form-group">
                                        <label>Nombre completo</label>
                                        <input type="text" id="profile-name" value="${this.user?.name || ''}" placeholder="Tu nombre">
                                    </div>
                                    <div class="form-group">
                                        <label>Correo electrónico</label>
                                        <input type="email" id="profile-email" value="${this.user?.email || ''}" disabled>
                                        <small>El correo no puede ser modificado</small>
                                    </div>
                                    <div class="form-group">
                                        <label>Teléfono</label>
                                        <input type="tel" id="profile-phone" value="${this.user?.phone || ''}" placeholder="+52 123 456 7890">
                                    </div>
                                    <button type="submit" class="btn-save-profile">Guardar cambios</button>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Tab Pedidos -->
                        <div class="tab-pane" id="tab-pedidos">
                            <div class="profile-card">
                                <h3>Historial de Pedidos</h3>
                                <div class="orders-list" id="orders-list">
                                    <div class="empty-orders">
                                        <i class="fas fa-shopping-bag"></i>
                                        <p>No tienes pedidos aún</p>
                                        <a href="/tienda" class="btn-shop-now" data-link>Explorar productos</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Direcciones -->
                        <div class="tab-pane" id="tab-direcciones">
                            <div class="profile-card">
                                <div class="addresses-header">
                                    <h3>Mis Direcciones</h3>
                                    <button class="btn-add-address" id="add-address-btn">
                                        <i class="fas fa-plus"></i> Agregar dirección
                                    </button>
                                </div>
                                <div class="addresses-list" id="addresses-list">
                                    <div class="empty-addresses">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <p>No tienes direcciones guardadas</p>
                                        <button class="btn-add-first-address">Agregar dirección</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Seguridad -->
                        <div class="tab-pane" id="tab-seguridad">
                            <div class="profile-card">
                                <h3>Cambiar Contraseña</h3>
                                <form id="password-form" class="profile-form">
                                    <div class="form-group">
                                        <label>Contraseña actual</label>
                                        <input type="password" id="current-password" placeholder="••••••">
                                    </div>
                                    <div class="form-group">
                                        <label>Nueva contraseña</label>
                                        <input type="password" id="new-password" placeholder="Mínimo 6 caracteres">
                                    </div>
                                    <div class="form-group">
                                        <label>Confirmar nueva contraseña</label>
                                        <input type="password" id="confirm-password" placeholder="••••••">
                                    </div>
                                    <button type="submit" class="btn-save-profile">Actualizar contraseña</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initTabs();
        this.initProfileForm();
        this.initPasswordForm();
        this.initAddressForm();
        
        return this;
    }
    
    getMemberSince() {
        if (this.user?.createdAt) {
            const date = new Date(this.user.createdAt);
            return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
        }
        return 'reciente';
    }
    
    initTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const panes = document.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }
    
    initProfileForm() {
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('profile-name').value;
                const phone = document.getElementById('profile-phone').value;
                
                try {
                    const token = store.get('auth.token');
                    const response = await fetch('/api/auth/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ name, phone })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        store.set('auth.user', data.user);
                        showNotification('Perfil actualizado correctamente', 'success');
                    } else {
                        throw new Error(data.message || 'Error al actualizar');
                    }
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            });
        }
    }
    
    initPasswordForm() {
        const form = document.getElementById('password-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                if (newPassword !== confirmPassword) {
                    showNotification('Las contraseñas no coinciden', 'error');
                    return;
                }
                
                if (newPassword.length < 6) {
                    showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
                    return;
                }
                
                try {
                    const token = store.get('auth.token');
                    const response = await fetch('/api/auth/password', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ currentPassword, newPassword })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        showNotification('Contraseña actualizada correctamente', 'success');
                        form.reset();
                    } else {
                        throw new Error(data.message || 'Error al actualizar contraseña');
                    }
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            });
        }
    }
    
    initAddressForm() {
        const addBtn = document.getElementById('add-address-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddressModal();
            });
        }
    }
    
    showAddressModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-address';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Agregar dirección</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="address-form-modal">
                        <div class="form-group">
                            <label>Calle y número</label>
                            <input type="text" id="address-street" placeholder="Calle 123" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ciudad</label>
                                <input type="text" id="address-city" placeholder="Ciudad" required>
                            </div>
                            <div class="form-group">
                                <label>Código Postal</label>
                                <input type="text" id="address-zip" placeholder="CP" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Estado</label>
                                <input type="text" id="address-state" placeholder="Estado" required>
                            </div>
                            <div class="form-group">
                                <label>País</label>
                                <input type="text" id="address-country" placeholder="México" value="México" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="address-default"> Establecer como dirección principal
                            </label>
                        </div>
                        <button type="submit" class="btn-save-address">Guardar dirección</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Manejar submit
        const form = modal.querySelector('#address-form-modal');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Dirección guardada (demo)', 'success');
            modal.remove();
        });
    }
    
    destroy() {}
}