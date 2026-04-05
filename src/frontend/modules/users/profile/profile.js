/**
 * Módulo Perfil de Usuario
 * profile.js - Vista de perfil de usuario con diseño renovado
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';
import { addPasswordToggle } from '../../../utils/passwordToggle.js';
import { 
    checkPasswordStrength, 
    updatePasswordStrengthUI,
    getPasswordStrengthElements,
    validatePasswordMatch,
    getMissingRequirementsMessage
} from '../../../utils/passwordStrength.js';

const ZONAS_ENVIO_MAZATLAN = [
    '82000', '82010', '82020', '82030', '82040', '82050', '82060', '82070', '82080', '82090',
    '82100', '82110', '82120', '82130', '82140', '82150', '82160', '82170', '82180', '82190',
    '82200', '82210', '82220', '82230', '82240', '82250', '82260', '82270', '82280', '82290'
];

const CIUDADES = ['Mazatlán'];
const ESTADOS = ['Sinaloa'];

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
                                            <input type="tel" id="profile-phone" value="${this.user?.phone || ''}" placeholder="669 123 4567">
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
                                            <input type="password" id="current-password" placeholder="••••••" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Nueva contraseña</label>
                                            <input type="password" id="new-password" placeholder="Mínimo 8 caracteres" required>
                                            <div class="password-strength" id="password-strength">
                                                <div class="strength-bar"></div>
                                                <div class="strength-bar"></div>
                                                <div class="strength-bar"></div>
                                                <div class="strength-bar"></div>
                                            </div>
                                            <div class="strength-text" id="strength-text"></div>
                                            <ul class="password-requirements" id="password-requirements">
                                                <li id="req-length"><i class="fas fa-circle"></i> Mínimo 8 caracteres</li>
                                                <li id="req-upper"><i class="fas fa-circle"></i> Al menos una mayúscula</li>
                                                <li id="req-lower"><i class="fas fa-circle"></i> Al menos una minúscula</li>
                                                <li id="req-number"><i class="fas fa-circle"></i> Al menos un número</li>
                                                <li id="req-special"><i class="fas fa-circle"></i> Al menos un carácter especial (!@#$%^&*)</li>
                                                <li id="req-common"><i class="fas fa-circle"></i> No puede ser una contraseña común</li>
                                            </ul>
                                            <span class="error-message"></span>
                                        </div>
                                        <div class="form-group">
                                            <label>Confirmar nueva contraseña</label>
                                            <input type="password" id="confirm-password" placeholder="Repite tu contraseña" required>
                                            <span class="error-message"></span>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn-save" id="password-submit">
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

        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        if (currentPasswordInput) addPasswordToggle(currentPasswordInput);
        if (newPasswordInput) addPasswordToggle(newPasswordInput);
        if (confirmPasswordInput) addPasswordToggle(confirmPasswordInput);

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
        const savedAddresses = localStorage.getItem('user_addresses');
        if (savedAddresses) {
            this.addresses = JSON.parse(savedAddresses);
        } else {
            this.addresses = [];
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
                    <p><strong>${this.escapeHtml(addr.street)}</strong></p>
                    <p>${this.escapeHtml(addr.number ? addr.number : '')}</p>
                    <p>${this.escapeHtml(addr.neighborhood || '')}</p>
                    <p>${this.escapeHtml(addr.city)}, ${this.escapeHtml(addr.state)}</p>
                    <p>CP ${addr.zipCode}</p>
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

    // ============================================
    // FUNCIONES DE FORTALEZA DE CONTRASEÑA
    // ============================================

    getCommonPasswords() {
        return [
            '123456', '12345678', '123456789', '12345', '1234567890',
            'password', 'contraseña', 'contrasena', 'admin', 'qwerty',
            'qwerty123', 'abc123', '111111', '222222', '333333',
            '123123', 'abcabc', 'password123', 'letmein', 'welcome',
            'monkey', 'dragon', 'master', 'sunshine', 'iloveyou',
            'princess', 'football', 'baseball', 'superman', 'batman',
            'asdfgh', 'zxcvbn', 'qazwsx', 'qwertyuiop', '123456a',
            'a123456', '123456q', 'ginger', 'gingercaps', 'mazatlan'
        ];
    }

    isCommonPassword(password) {
        const common = this.getCommonPasswords();
        const lowerPassword = password.toLowerCase();
        return common.includes(lowerPassword);
    }

    checkPasswordStrength(password) {
        let score = 0;
        const requirements = {
            length: false,
            upper: false,
            lower: false,
            number: false,
            special: false,
            common: false
        };

        if (password.length >= 8) {
            requirements.length = true;
            score++;
        }

        if (/[A-Z]/.test(password)) {
            requirements.upper = true;
            score++;
        }

        if (/[a-z]/.test(password)) {
            requirements.lower = true;
            score++;
        }

        if (/[0-9]/.test(password)) {
            requirements.number = true;
            score++;
        }

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            requirements.special = true;
            score++;
        }

        if (!this.isCommonPassword(password)) {
            requirements.common = true;
            score++;
        } else {
            requirements.common = false;
        }

        return { score, requirements };
    }

    updateStrengthUI(password) {
        const { score, requirements } = this.checkPasswordStrength(password);
        const strengthBars = document.querySelectorAll('#password-strength .strength-bar');
        const strengthText = document.getElementById('strength-text');

        strengthBars.forEach((bar, index) => {
            if (index < score) {
                bar.classList.add('active');
                if (score <= 2) {
                    bar.style.background = '#F44336';
                } else if (score === 3) {
                    bar.style.background = '#FF9800';
                } else if (score === 4) {
                    bar.style.background = '#2196F3';
                } else if (score >= 5) {
                    bar.style.background = '#4CAF50';
                }
            } else {
                bar.classList.remove('active');
                bar.style.background = '';
            }
        });

        if (password.length === 0) {
            strengthText.textContent = '';
            strengthText.className = '';
        } else if (score <= 2) {
            strengthText.textContent = 'Contraseña débil';
            strengthText.className = 'strength-weak';
        } else if (score === 3) {
            strengthText.textContent = 'Contraseña media';
            strengthText.className = 'strength-medium';
        } else if (score === 4) {
            strengthText.textContent = 'Contraseña fuerte';
            strengthText.className = 'strength-strong';
        } else if (score >= 5) {
            strengthText.textContent = 'Contraseña muy fuerte';
            strengthText.className = 'strength-very-strong';
        }

        const reqLength = document.getElementById('req-length');
        const reqUpper = document.getElementById('req-upper');
        const reqLower = document.getElementById('req-lower');
        const reqNumber = document.getElementById('req-number');
        const reqSpecial = document.getElementById('req-special');
        const reqCommon = document.getElementById('req-common');

        if (reqLength) this.updateRequirementIcon(reqLength, requirements.length);
        if (reqUpper) this.updateRequirementIcon(reqUpper, requirements.upper);
        if (reqLower) this.updateRequirementIcon(reqLower, requirements.lower);
        if (reqNumber) this.updateRequirementIcon(reqNumber, requirements.number);
        if (reqSpecial) this.updateRequirementIcon(reqSpecial, requirements.special);
        if (reqCommon) this.updateRequirementIcon(reqCommon, requirements.common);

        const submitBtn = document.getElementById('password-submit');
        const confirmPassword = document.getElementById('confirm-password').value;
        const passwordsMatch = confirmPassword === password;

        if (submitBtn) {
            const isValid = requirements.length && requirements.upper &&
                requirements.lower && requirements.number &&
                requirements.special && requirements.common;
            submitBtn.disabled = !(isValid && passwordsMatch && password.length > 0);
        }

        return requirements;
    }

    updateRequirementIcon(element, isValid) {
        const icon = element.querySelector('i');
        if (icon) {
            if (isValid) {
                icon.className = 'fas fa-check-circle';
                icon.style.color = '#4CAF50';
                element.classList.add('valid');
            } else {
                icon.className = 'fas fa-circle';
                icon.style.color = '';
                element.classList.remove('valid');
            }
        }
    }

    initPasswordForm() {
    const form = document.getElementById('password-form');
    const passwordInput = document.getElementById('new-password');
    const confirmInput = document.getElementById('confirm-password');
    const confirmError = document.getElementById('confirm-password')?.parentElement?.querySelector('.error-message');
    const elements = getPasswordStrengthElements();
    
    // Validación de fortaleza en tiempo real
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            updatePasswordStrengthUI(password, elements);
            if (confirmInput.value) {
                validatePasswordMatch(passwordInput, confirmInput, confirmError);
            }
        });
    }
    
    if (confirmInput) {
        confirmInput.addEventListener('input', () => {
            validatePasswordMatch(passwordInput, confirmInput, confirmError);
            const password = passwordInput?.value || '';
            const { requirements } = checkPasswordStrength(password);
            const submitBtn = document.getElementById('password-submit');
            if (submitBtn) {
                const isValid = requirements.length && requirements.upper && 
                               requirements.lower && requirements.number && 
                               requirements.special && requirements.common;
                submitBtn.disabled = !(isValid && validatePasswordMatch(passwordInput, confirmInput, confirmError) && password.length > 0);
            }
        });
    }
    
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
            
            const { score, requirements } = checkPasswordStrength(newPassword);
            
            if (score < 5) {
                const missing = getMissingRequirementsMessage(requirements);
                showNotification(`⚠️ Contraseña débil. Requisitos faltantes:\n${missing.join('\n')}`, 'warning', 5000);
                return;
            }
            
            const submitBtn = document.getElementById('password-submit');
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
                    // Resetear UI de fortaleza
                    const strengthBars = document.querySelectorAll('#password-strength .strength-bar');
                    strengthBars.forEach(bar => {
                        bar.classList.remove('active');
                        bar.style.background = '';
                    });
                    const strengthText = document.getElementById('strength-text');
                    if (strengthText) strengthText.textContent = '';
                    const reqs = ['req-length', 'req-upper', 'req-lower', 'req-number', 'req-special', 'req-common'];
                    reqs.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) {
                            const icon = el.querySelector('i');
                            if (icon) {
                                icon.className = 'fas fa-circle';
                                icon.style.color = '';
                                el.classList.remove('valid');
                            }
                        }
                    });
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

    validatePasswordMatch() {
        const password = document.getElementById('new-password')?.value || '';
        const confirmPassword = document.getElementById('confirm-password')?.value || '';
        const confirmError = document.getElementById('confirm-password')?.parentElement?.querySelector('.error-message');

        if (confirmPassword && password !== confirmPassword) {
            if (confirmError) {
                confirmError.textContent = '❌ Las contraseñas no coinciden';
                confirmError.style.display = 'block';
            }
            return false;
        } else {
            if (confirmError) {
                confirmError.textContent = '';
                confirmError.style.display = 'none';
            }
            return true;
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
                    <div class="info-notice">
                        <i class="fas fa-info-circle"></i>
                        <div class="info-notice-content">
                            <strong>📍 Solo envíos en Mazatlán, Sinaloa</strong>
                            <p>Por el momento, realizamos entregas únicamente en Mazatlán y sus alrededores. Asegúrate de que tu código postal sea válido para esta zona.</p>
                        </div>
                    </div>
                    
                    <form id="address-form-modal">
                        <div class="form-group">
                            <label>Calle</label>
                            <input type="text" id="address-street" value="${isEditing ? this.escapeHtml(address.street) : ''}" placeholder="Av. del Mar" required>
                        </div>
                        <div class="form-group">
                            <label>Número</label>
                            <input type="text" id="address-number" value="${isEditing ? this.escapeHtml(address.number || '') : ''}" placeholder="1234">
                        </div>
                        <div class="form-group">
                            <label>Colonia</label>
                            <input type="text" id="address-neighborhood" value="${isEditing ? this.escapeHtml(address.neighborhood || '') : ''}" placeholder="Marina Mazatlán" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ciudad</label>
                                <select id="address-city" required>
                                    ${CIUDADES.map(city => `<option value="${city}" ${isEditing && address.city === city ? 'selected' : ''}>${city}</option>`).join('')}
                                </select>
                                <small class="form-hint">Actualmente solo disponible Mazatlán</small>
                            </div>
                            <div class="form-group">
                                <label>Código Postal</label>
                                <input type="text" id="address-zip" value="${isEditing ? this.escapeHtml(address.zipCode) : ''}" placeholder="82110" maxlength="5" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Estado</label>
                                <select id="address-state" required>
                                    ${ESTADOS.map(state => `<option value="${state}" ${isEditing && address.state === state ? 'selected' : ''}>${state}</option>`).join('')}
                                </select>
                                <small class="form-hint">Actualmente solo disponible Sinaloa</small>
                            </div>
                            <div class="form-group">
                                <label>País</label>
                                <input type="text" id="address-country" value="México" readonly disabled style="background: var(--gray-100);">
                            </div>
                        </div>
                        <div id="address-warning" class="delivery-warning" style="display: none;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Este código postal no corresponde a Mazatlán, Sinaloa. Por favor verifica.</span>
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

        const zipInput = document.getElementById('address-zip');
        const warning = document.getElementById('address-warning');

        const validateZip = () => {
            const zip = zipInput?.value || '';
            if (zip.length === 5 && !ZONAS_ENVIO_MAZATLAN.includes(zip)) {
                warning.style.display = 'flex';
                return false;
            } else {
                warning.style.display = 'none';
                return true;
            }
        };

        if (zipInput) zipInput.addEventListener('input', validateZip);

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        const form = modal.querySelector('#address-form-modal');
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const street = document.getElementById('address-street').value.trim();
            const number = document.getElementById('address-number').value.trim();
            const neighborhood = document.getElementById('address-neighborhood').value.trim();
            const city = document.getElementById('address-city').value;
            const zipCode = document.getElementById('address-zip').value.trim();
            const state = document.getElementById('address-state').value;

            if (!street || !neighborhood || !city || !zipCode || !state) {
                showNotification('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            if (!ZONAS_ENVIO_MAZATLAN.includes(zipCode)) {
                showNotification('El código postal no corresponde a Mazatlán, Sinaloa', 'error');
                return;
            }

            const fullStreet = number ? `${street} ${number}` : street;

            const newAddress = {
                id: isEditing ? address.id : Date.now(),
                street: fullStreet,
                number: number,
                neighborhood: neighborhood,
                city: city,
                zipCode: zipCode,
                state: state,
                country: 'México',
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
        return str.replace(/[&<>]/g, function (m) {
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

    destroy() { }
}