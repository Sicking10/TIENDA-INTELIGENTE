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
        // Verificar autenticación
        if (!this.isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        
        this.loadOrders();
        this.loadAddresses();
        
        // Cargar avatar guardado
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
                        <!-- Sidebar -->
                        <aside class="profile-sidebar">
                            <div class="sidebar-menu">
                                <button class="sidebar-btn active" data-tab="personal">
                                    <i class="fas fa-user"></i>
                                    <span>Información Personal</span>
                                </button>
                                <button class="sidebar-btn" data-tab="pedidos">
                                    <i class="fas fa-shopping-bag"></i>
                                    <span>Mis Pedidos</span>
                                    <span class="badge" id="orders-count">${this.orders.length}</span>
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
                                <button class="sidebar-btn" data-tab="suscripcion">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>Suscripción</span>
                                </button>
                            </div>
                        </aside>

                        <!-- Main Content -->
                        <main class="profile-main">
                            <!-- Tab Personal -->
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

                            <!-- Tab Pedidos -->
                            <div class="tab-pane" id="tab-pedidos">
                                <div class="profile-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-history"></i> Historial de Pedidos</h3>
                                        <p>Todos tus pedidos realizados</p>
                                    </div>
                                    <div class="orders-list" id="orders-list">
                                        ${this.renderOrders()}
                                    </div>
                                </div>
                            </div>

                            <!-- Tab Direcciones -->
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

                            <!-- Tab Seguridad -->
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

                            <!-- Tab Suscripción -->
                            <div class="tab-pane" id="tab-suscripcion">
                                <div class="profile-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-calendar-alt"></i> Plan de Suscripción</h3>
                                        <p>Gestiona tu suscripción mensual</p>
                                    </div>
                                    <div class="subscription-info">
                                        <div class="subscription-status">
                                            <span class="status-badge inactive">Sin suscripción activa</span>
                                            <p>Actualmente no tienes una suscripción activa</p>
                                        </div>
                                        <div class="subscription-plans">
                                            <h4>Planes disponibles</h4>
                                            <div class="plan-cards">
                                                <div class="plan-card">
                                                    <div class="plan-name">Plan Básico</div>
                                                    <div class="plan-price">$299<span>/mes</span></div>
                                                    <ul class="plan-features">
                                                        <li>1 frasco al mes</li>
                                                        <li>30 cápsulas</li>
                                                        <li>Envío estándar</li>
                                                    </ul>
                                                    <button class="btn-select-plan">Seleccionar</button>
                                                </div>
                                                <div class="plan-card featured">
                                                    <div class="plan-badge">Más popular</div>
                                                    <div class="plan-name">Plan Plus</div>
                                                    <div class="plan-price">$549<span>/mes</span></div>
                                                    <ul class="plan-features">
                                                        <li>2 frascos al mes</li>
                                                        <li>60 cápsulas</li>
                                                        <li>Envío express gratis</li>
                                                        <li>10% descuento</li>
                                                    </ul>
                                                    <button class="btn-select-plan primary">Seleccionar</button>
                                                </div>
                                                <div class="plan-card">
                                                    <div class="plan-name">Plan Pro</div>
                                                    <div class="plan-price">$999<span>/mes</span></div>
                                                    <ul class="plan-features">
                                                        <li>4 frascos al mes</li>
                                                        <li>120 cápsulas</li>
                                                        <li>Envío prioritario</li>
                                                        <li>20% descuento</li>
                                                    </ul>
                                                    <button class="btn-select-plan">Seleccionar</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
        this.initSubscriptionPlans();
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
        // Datos de ejemplo - en producción vendrían del backend
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
        // Datos de ejemplo - en producción vendrían del backend
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
                        // Actualizar nombre en el header
                        const nameHeader = document.querySelector('.profile-info h1');
                        if (nameHeader) nameHeader.textContent = name;
                        // Actualizar iniciales en el avatar
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
    
    initSubscriptionPlans() {
        const planBtns = document.querySelectorAll('.btn-select-plan');
        planBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                showNotification('Funcionalidad de suscripción próximamente', 'info');
            });
        });
    }
    
    // ============================================
    // FUNCIONALIDAD DE CAMBIO DE FOTO DE PERFIL
    // ============================================
    initAvatarUpload() {
        const editBtn = document.getElementById('edit-avatar-btn');
        const fileInput = document.getElementById('avatar-input');
        const avatarContainer = document.getElementById('profile-avatar-container');
        
        if (!editBtn || !fileInput) return;
        
        // Abrir selector de archivos al hacer clic en la cámara
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
        
        // Manejar selección de archivo
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processAvatarFile(file);
            }
        });
        
        // También permitir arrastrar y soltar
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
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Formato no soportado. Usa JPG, PNG o WEBP', 'error');
        return;
    }
    
    // Validar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        showNotification('La imagen es demasiado grande. Máximo 2MB', 'error');
        return;
    }
    
    // Mostrar loading
    showNotification('Procesando imagen...', 'info');
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const imageDataUrl = event.target.result;
        
        // Crear imagen para redimensionar
        const img = new Image();
        img.onload = () => {
            // Redimensionar a 200x200 (manteniendo proporción)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = 200;
            let height = 200;
            
            canvas.width = width;
            canvas.height = height;
            
            // Calcular área de recorte para mantener proporción cuadrada
            const size = Math.min(img.width, img.height);
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            
            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, width, height);
            
            // Convertir a formato final
            const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
            
            // Actualizar el DOM
            this.updateAvatarDisplay(resizedImage);
            
            // Guardar en localStorage
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
        
        // Eliminar el div de iniciales si existe
        const avatarInitials = avatarContainer.querySelector('.avatar-initials');
        if (avatarInitials) {
            avatarInitials.remove();
        }
        
        // Eliminar imagen anterior si existe
        const existingImage = avatarContainer.querySelector('.avatar-image');
        if (existingImage) {
            existingImage.remove();
        }
        
        // Crear nueva imagen
        const img = document.createElement('img');
        img.src = imageDataUrl;
        img.alt = 'Avatar';
        img.className = 'avatar-image';
        img.id = 'avatar-image';
        
        // Insertar antes del botón de edición
        const editBtn = avatarContainer.querySelector('.avatar-edit-btn');
        avatarContainer.insertBefore(img, editBtn);
        
        // También actualizar en la navbar si es necesario
        this.updateNavbarAvatar(imageDataUrl);
    }
    
    updateNavbarAvatar(imageDataUrl) {
    // Actualizar avatar en la navbar (si existe)
    // Buscar diferentes posibles selectores de avatar en la navbar
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
        // Limpiar contenido existente
        navbarAvatar.innerHTML = '';
        
        // Crear imagen
        const img = document.createElement('img');
        img.src = imageDataUrl;
        img.alt = 'Avatar';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        
        navbarAvatar.appendChild(img);
        
        // También guardar en localStorage para que persista
        localStorage.setItem('user_avatar', imageDataUrl);
    }
    
    // Actualizar también el store de manera segura
    try {
        if (this.user) {
            this.user.avatar = imageDataUrl;
            // No llamar a store.set si no es necesario para evitar ciclos
            // store.set('auth.user', this.user);
        }
    } catch (error) {
        console.warn('Error actualizando store:', error);
    }
}
    
    showAddressModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-address';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Agregar nueva dirección</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="address-form-modal">
                        <div class="form-group">
                            <label>Calle y número</label>
                            <input type="text" id="address-street" placeholder="Calle 123, Colonia" required>
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
                                <input type="text" id="address-country" value="México" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="address-default"> Establecer como dirección principal
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-save-address">
                                <i class="fas fa-save"></i> Guardar dirección
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
            showNotification('Dirección guardada correctamente', 'success');
            modal.remove();
        });
    }
    
    destroy() {}
}