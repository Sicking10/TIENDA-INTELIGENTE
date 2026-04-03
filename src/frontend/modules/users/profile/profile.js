/**
 * Módulo Perfil de Usuario
 * profile.js - Vista de perfil de usuario con diseño renovado
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
        this.orders = [];
        this.addresses = [];
        this.avatarFile = null;
    }
    
    async render() {
        if (!this.isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        
        this.loadOrders();
        this.loadAddresses();
        
        const savedAvatar = localStorage.getItem('user_avatar');
        const avatarUrl = savedAvatar || null;
        
        this.container.innerHTML = `
            <div class="profile-page">
                <div class="profile-hero">
                    <div class="profile-hero-bg">
                        <div class="hero-glow hero-glow-1"></div>
                        <div class="hero-glow hero-glow-2"></div>
                    </div>
                    <div class="container">
                        <div class="profile-hero-content">
                            <div class="profile-avatar-large" id="profile-avatar-container">
                                ${avatarUrl ? 
                                    `<img src="${avatarUrl}" alt="Avatar" class="avatar-image" id="avatar-image">` :
                                    `<div class="avatar-initials" id="avatar-initials">${this.getInitials()}</div>`
                                }
                                <button class="avatar-edit-btn" id="edit-avatar-btn" title="Cambiar foto de perfil">
                                    <i class="fas fa-camera"></i>
                                </button>
                                <input type="file" id="avatar-input" accept="image/jpeg,image/png,image/jpg" style="display: none;">
                            </div>
                            <div class="profile-info">
                                <h1>${this.user?.name || 'Usuario'}</h1>
                                <p>${this.user?.email || ''}</p>
                                <span class="profile-badge">
                                    <i class="fas fa-calendar-alt"></i> Miembro desde ${this.getMemberSince()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div class="profile-layout">
                        <aside class="profile-sidebar">
                            <div class="sidebar-menu">
                                <button class="sidebar-btn active" data-tab="personal">
                                    <i class="fas fa-user"></i>
                                    <span>Información Personal</span>
                                </button>
                                <button class="sidebar-btn" data-tab="direcciones">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>Direcciones</span>
                                    <span class="badge" id="addresses-count">${this.addresses.length}</span>
                                </button>
                                <button class="sidebar-btn" data-tab="seguridad">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Seguridad</span>
                                </button>
                            </div>
                        </aside>

                        <main class="profile-main">
                            <div class="tab-pane active" id="tab-personal">
                                <div class="profile-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-user-edit"></i> Información Personal</h3>
                                        <p>Actualiza tus datos personales</p>
                                    </div>
                                    <form id="profile-form" class="profile-form">
                                        <div class="form-group">
                                            <label>Nombre completo</label>
                                            <input type="text" id="profile-name" value="${this.user?.name || ''}" placeholder="Tu nombre">
                                        </div>
                                        <div class="form-group">
                                            <label>Correo electrónico</label>
                                            <input type="email" id="profile-email" value="${this.user?.email || ''}" disabled>
                                            <small class="form-hint">El correo no puede ser modificado</small>
                                        </div>
                                        <div class="form-group">
                                            <label>Teléfono</label>
                                            <input type="tel" id="profile-phone" value="${this.user?.phone || ''}" placeholder="+52 123 456 7890">
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn-save">
                                                <i class="fas fa-save"></i> Guardar cambios
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div class="tab-pane" id="tab-direcciones">
                                <div class="profile-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-map-marker-alt"></i> Mis Direcciones</h3>
                                        <p>Gestiona tus direcciones de envío</p>
                                        <button class="btn-add-address" id="add-address-btn">
                                            <i class="fas fa-plus"></i> Nueva dirección
                                        </button>
                                    </div>
                                    <div class="addresses-list" id="addresses-list">
                                        ${this.renderAddresses()}
                                    </div>
                                </div>
                            </div>

                            <div class="tab-pane" id="tab-seguridad">
                                <div class="profile-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-lock"></i> Cambiar Contraseña</h3>
                                        <p>Actualiza tu contraseña periódicamente para mayor seguridad</p>
                                    </div>
                                    <form id="password-form" class="profile-form">
                                        <div class="form-group">
                                            <label>Contraseña actual</label>
                                            <input type="password" id="current-password" placeholder="••••••">
                                        </div>
                                        <div class="form-group">
                                            <label>Nueva contraseña</label>
                                            <input type="password" id="new-password" placeholder="Mínimo 6 caracteres">
                                            <small class="form-hint">La contraseña debe tener al menos 6 caracteres</small>
                                        </div>
                                        <div class="form-group">
                                            <label>Confirmar nueva contraseña</label>
                                            <input type="password" id="confirm-password" placeholder="••••••">
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn-save">
                                                <i class="fas fa-key"></i> Actualizar contraseña
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;
        
        this.initTabs();
        this.initProfileForm();
        this.initPasswordForm();
        this.initAddressForm();
        this.initAddressActions();
        this.initAvatarUpload();
        
        return this;
    }
    
    getInitials() {
        const name = this.user?.name || 'U';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    
    getMemberSince() {
        if (this.user?.createdAt) {
            const date = new Date(this.user.createdAt);
            return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
        }
        return 'reciente';
    }
    
    loadOrders() {
        this.orders = [
            {
                id: 'GIN-001',
                date: '15 Marzo, 2024',
                total: 349,
                status: 'delivered',
                items: 1,
                products: ['GINGERcaps Original']
            },
            {
                id: 'GIN-002',
                date: '10 Febrero, 2024',
                total: 449,
                status: 'delivered',
                items: 1,
                products: ['GINGERcaps Plus']
            },
            {
                id: 'GIN-003',
                date: '5 Enero, 2024',
                total: 899,
                status: 'delivered',
                items: 2,
                products: ['Kit Detox 30 Días']
            }
        ];
    }
    
    loadAddresses() {
        // Cargar direcciones guardadas en localStorage
        const savedAddresses = localStorage.getItem('user_addresses');
        if (savedAddresses) {
            this.addresses = JSON.parse(savedAddresses);
        } else {
            this.addresses = [
                {
                    id: 1,
                    street: 'Av. Reforma 123',
                    city: 'Ciudad de México',
                    state: 'CDMX',
                    zipCode: '06500',
                    country: 'México',
                    isDefault: true
                }
            ];
            this.saveAddressesToLocalStorage();
        }
    }
    
    saveAddressesToLocalStorage() {
        localStorage.setItem('user_addresses', JSON.stringify(this.addresses));
    }
    
    renderOrders() {
        if (this.orders.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h4>No tienes pedidos aún</h4>
                    <p>Realiza tu primera compra y aparecerá aquí</p>
                    <a href="/tienda" class="btn-shop" data-link>Explorar productos</a>
                </div>
            `;
        }
        
        return this.orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <span class="order-number">Pedido #${order.id}</span>
                        <span class="order-date"><i class="far fa-calendar-alt"></i> ${order.date}</span>
                    </div>
                    <div class="order-status ${order.status}">
                        ${this.getStatusText(order.status)}
                    </div>
                </div>
                <div class="order-body">
                    <div class="order-products">
                        ${order.products.map(p => `<span class="product-tag">${p}</span>`).join('')}
                    </div>
                    <div class="order-total">
                        <span>Total:</span>
                        <strong>$${order.total}</strong>
                    </div>
                </div>
                <div class="order-footer">
                    <button class="btn-track" data-order="${order.id}">
                        <i class="fas fa-truck"></i> Seguir pedido
                    </button>
                    <button class="btn-reorder" data-order="${order.id}">
                        <i class="fas fa-redo"></i> Comprar de nuevo
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderAddresses() {
        if (this.addresses.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt"></i>
                    <h4>No tienes direcciones guardadas</h4>
                    <p>Agrega una dirección para facilitar tus compras</p>
                </div>
            `;
        }
        
        return this.addresses.map(addr => `
            <div class="address-card ${addr.isDefault ? 'default' : ''}">
                <div class="address-header">
                    <div class="address-type">
                        ${addr.isDefault ? '<i class="fas fa-star"></i> Principal' : 'Dirección'}
                    </div>
                    <div class="address-actions">
                        <button class="address-edit" data-id="${addr.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="address-delete" data-id="${addr.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="address-content">
                    <p>${addr.street}</p>
                    <p>${addr.city}, ${addr.state}</p>
                    <p>CP ${addr.zipCode}, ${addr.country}</p>
                </div>
                ${!addr.isDefault ? '<button class="btn-set-default" data-id="' + addr.id + '">Establecer como principal</button>' : ''}
            </div>
        `).join('');
    }
    
    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'processing': 'Procesando',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }
    
    initTabs() {
        const btns = document.querySelectorAll('.sidebar-btn');
        const panes = document.querySelectorAll('.tab-pane');
        
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                btns.forEach(b => b.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                const targetPane = document.getElementById(`tab-${tabId}`);
                if (targetPane) targetPane.classList.add('active');
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
                
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                submitBtn.disabled = true;
                
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
                        const nameHeader = document.querySelector('.profile-info h1');
                        if (nameHeader) nameHeader.textContent = name;
                        const avatarInitials = document.getElementById('avatar-initials');
                        if (avatarInitials && !localStorage.getItem('user_avatar')) {
                            const newInitials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            avatarInitials.textContent = newInitials;
                        }
                    } else {
                        throw new Error(data.message || 'Error al actualizar');
                    }
                } catch (error) {
                    showNotification(error.message, 'error');
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
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
                
                if (!currentPassword) {
                    showNotification('Ingresa tu contraseña actual', 'error');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    showNotification('Las contraseñas no coinciden', 'error');
                    return;
                }
                
                if (newPassword.length < 6) {
                    showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
                    return;
                }
                
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
                submitBtn.disabled = true;
                
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
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
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
    
    initAddressActions() {
        // Editar dirección
        document.querySelectorAll('.address-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const addressId = parseInt(btn.dataset.id);
                const address = this.addresses.find(a => a.id === addressId);
                if (address) {
                    this.showAddressModal(address);
                }
            });
        });
        
        // Eliminar dirección
        document.querySelectorAll('.address-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const addressId = parseInt(btn.dataset.id);
                const address = this.addresses.find(a => a.id === addressId);
                
                if (address && confirm(`¿Eliminar la dirección "${address.street}"?`)) {
                    this.addresses = this.addresses.filter(a => a.id !== addressId);
                    this.saveAddressesToLocalStorage();
                    this.renderAddressesList();
                    showNotification('Dirección eliminada', 'success');
                }
            });
        });
        
        // Establecer como principal
        document.querySelectorAll('.btn-set-default').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const addressId = parseInt(btn.dataset.id);
                this.addresses.forEach(a => {
                    a.isDefault = (a.id === addressId);
                });
                this.saveAddressesToLocalStorage();
                this.renderAddressesList();
                showNotification('Dirección principal actualizada', 'success');
            });
        });
    }
    
    renderAddressesList() {
        const container = document.getElementById('addresses-list');
        if (container) {
            container.innerHTML = this.renderAddresses();
            this.initAddressActions();
        }
        const badge = document.getElementById('addresses-count');
        if (badge) badge.textContent = this.addresses.length;
    }
    
    showAddressModal(address = null) {
        const isEditing = !!address;
        const modal = document.createElement('div');
        modal.className = 'modal-address';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEditing ? 'Editar dirección' : 'Agregar nueva dirección'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="address-form-modal">
                        <div class="form-group">
                            <label>Calle y número</label>
                            <input type="text" id="address-street" value="${isEditing ? this.escapeHtml(address.street) : ''}" placeholder="Calle 123, Colonia" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ciudad</label>
                                <input type="text" id="address-city" value="${isEditing ? this.escapeHtml(address.city) : ''}" placeholder="Ciudad" required>
                            </div>
                            <div class="form-group">
                                <label>Código Postal</label>
                                <input type="text" id="address-zip" value="${isEditing ? this.escapeHtml(address.zipCode) : ''}" placeholder="CP" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Estado</label>
                                <input type="text" id="address-state" value="${isEditing ? this.escapeHtml(address.state) : ''}" placeholder="Estado" required>
                            </div>
                            <div class="form-group">
                                <label>País</label>
                                <input type="text" id="address-country" value="${isEditing ? this.escapeHtml(address.country) : 'México'}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="address-default" ${isEditing && address.isDefault ? 'checked' : ''}> 
                                Establecer como dirección principal
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-save-address">
                                <i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'} dirección
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        const form = modal.querySelector('#address-form-modal');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newAddress = {
                id: isEditing ? address.id : Date.now(),
                street: document.getElementById('address-street').value,
                city: document.getElementById('address-city').value,
                zipCode: document.getElementById('address-zip').value,
                state: document.getElementById('address-state').value,
                country: document.getElementById('address-country').value,
                isDefault: document.getElementById('address-default').checked
            };
            
            if (isEditing) {
                const index = this.addresses.findIndex(a => a.id === address.id);
                if (index !== -1) {
                    this.addresses[index] = newAddress;
                }
            } else {
                if (newAddress.isDefault) {
                    this.addresses.forEach(a => a.isDefault = false);
                }
                this.addresses.push(newAddress);
            }
            
            this.saveAddressesToLocalStorage();
            this.renderAddressesList();
            showNotification(isEditing ? 'Dirección actualizada' : 'Dirección guardada', 'success');
            modal.remove();
        });
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
    
    initAvatarUpload() {
        const editBtn = document.getElementById('edit-avatar-btn');
        const fileInput = document.getElementById('avatar-input');
        const avatarContainer = document.getElementById('profile-avatar-container');
        
        if (!editBtn || !fileInput) return;
        
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processAvatarFile(file);
            }
        });
        
        if (avatarContainer) {
            avatarContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                avatarContainer.classList.add('drag-over');
            });
            
            avatarContainer.addEventListener('dragleave', () => {
                avatarContainer.classList.remove('drag-over');
            });
            
            avatarContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                avatarContainer.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.processAvatarFile(file);
                } else {
                    showNotification('Por favor, selecciona una imagen válida', 'error');
                }
            });
        }
    }
    
    processAvatarFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('Formato no soportado. Usa JPG, PNG o WEBP', 'error');
            return;
        }
        
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('La imagen es demasiado grande. Máximo 2MB', 'error');
            return;
        }
        
        showNotification('Procesando imagen...', 'info');
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageDataUrl = event.target.result;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = 200;
                let height = 200;
                
                canvas.width = width;
                canvas.height = height;
                
                const size = Math.min(img.width, img.height);
                const offsetX = (img.width - size) / 2;
                const offsetY = (img.height - size) / 2;
                
                ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, width, height);
                
                const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
                
                this.updateAvatarDisplay(resizedImage);
                localStorage.setItem('user_avatar', resizedImage);
                
                showNotification('Foto de perfil actualizada', 'success');
            };
            img.src = imageDataUrl;
        };
        reader.readAsDataURL(file);
    }
    
    updateAvatarDisplay(imageDataUrl) {
        const avatarContainer = document.getElementById('profile-avatar-container');
        if (!avatarContainer) return;
        
        const avatarInitials = avatarContainer.querySelector('.avatar-initials');
        if (avatarInitials) {
            avatarInitials.remove();
        }
        
        const existingImage = avatarContainer.querySelector('.avatar-image');
        if (existingImage) {
            existingImage.remove();
        }
        
        const img = document.createElement('img');
        img.src = imageDataUrl;
        img.alt = 'Avatar';
        img.className = 'avatar-image';
        img.id = 'avatar-image';
        
        const editBtn = avatarContainer.querySelector('.avatar-edit-btn');
        avatarContainer.insertBefore(img, editBtn);
        
        this.updateNavbarAvatar(imageDataUrl);
    }
    
    updateNavbarAvatar(imageDataUrl) {
        const navbarAvatarSelectors = [
            '.avatar-circle',
            '.user-avatar',
            '#user-avatar',
            '.ginger-nav-user-avatar',
            '.nav-user-avatar'
        ];
        
        let navbarAvatar = null;
        for (const selector of navbarAvatarSelectors) {
            navbarAvatar = document.querySelector(selector);
            if (navbarAvatar) break;
        }
        
        if (navbarAvatar) {
            navbarAvatar.innerHTML = '';
            const img = document.createElement('img');
            img.src = imageDataUrl;
            img.alt = 'Avatar';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            navbarAvatar.appendChild(img);
            localStorage.setItem('user_avatar', imageDataUrl);
        }
        
        try {
            if (this.user) {
                this.user.avatar = imageDataUrl;
            }
        } catch (error) {
            console.warn('Error actualizando store:', error);
        }
    }
    
    destroy() {}
}