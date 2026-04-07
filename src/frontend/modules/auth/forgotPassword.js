/**
 * Módulo Recuperar Contraseña
 * Flujo: Email → Código de 6 dígitos → Nueva contraseña con fortaleza
 * Con persistencia de estado al recargar
 */

import { authGuard } from '../../authGuard.js';
import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { checkPasswordStrength } from '../../utils/passwordStrength.js';

export default class ForgotPasswordView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.step = 1; // 1: email, 2: código, 3: nueva contraseña
        this.email = '';
        this.resetToken = '';
        
        // 🔥 CARGAR ESTADO GUARDADO
        this.loadSavedState();
    }
    
    // 🔥 GUARDAR ESTADO EN SESSIONSTORAGE
    saveState() {
        const state = {
            step: this.step,
            email: this.email,
            resetToken: this.resetToken,
            timestamp: Date.now()
        };
        sessionStorage.setItem('forgot_password_state', JSON.stringify(state));
    }
    
    // 🔥 CARGAR ESTADO GUARDADO
    loadSavedState() {
        const saved = sessionStorage.getItem('forgot_password_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                // Verificar que no haya expirado (30 minutos)
                const isValid = (Date.now() - state.timestamp) < 30 * 60 * 1000;
                if (isValid) {
                    this.step = state.step;
                    this.email = state.email;
                    this.resetToken = state.resetToken;
                    console.log('📦 Estado recuperado:', { step: this.step, email: this.email });
                } else {
                    this.clearState();
                }
            } catch (e) {
                console.error('Error al cargar estado:', e);
                this.clearState();
            }
        }
    }
    
    // 🔥 LIMPIAR ESTADO
    clearState() {
        sessionStorage.removeItem('forgot_password_state');
        this.step = 1;
        this.email = '';
        this.resetToken = '';
    }
    
    async render() {
        // 🔥 IR AL PASO CORRECTO SEGÚN EL ESTADO GUARDADO
        if (this.step === 2 && this.email) {
            this.renderCodeStep();
        } else if (this.step === 3 && this.email && this.resetToken) {
            this.renderNewPasswordStep();
        } else {
            this.renderEmailStep();
        }
        return this;
    }
    
    renderEmailStep() {
        this.container.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h2>Recuperar Contraseña</h2>
                            <p>Te enviaremos un código de verificación</p>
                        </div>
                        
                        <form id="forgot-email-form" class="auth-form">
                            <div class="form-group">
                                <label for="email">Correo electrónico</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    placeholder="tu@email.com"
                                    value="${this.email}"
                                    required
                                    autocomplete="email"
                                >
                                <span class="error-message"></span>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-full">
                                <span class="btn-text">Enviar código</span>
                                <div class="btn-preloader hidden">
                                    <div class="preloader-spinner"></div>
                                    <span>Enviando...</span>
                                </div>
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p><a href="/login" data-link>← Volver al inicio de sesión</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEmailForm();
    }
    
    setupEmailForm() {
        const form = document.getElementById('forgot-email-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEmailSubmit();
            });
        }
    }
    
    async handleEmailSubmit() {
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        const submitBtn = document.querySelector('#forgot-email-form button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnPreloader = submitBtn.querySelector('.btn-preloader');
        
        if (!email) {
            showNotification('Ingresa tu correo electrónico', 'error');
            return;
        }
        
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            showNotification('Correo electrónico inválido', 'error');
            return;
        }
        
        btnText.classList.add('hidden');
        btnPreloader.classList.remove('hidden');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar el código');
            }
            
            this.email = email;
            this.step = 2;
            this.saveState(); // 🔥 GUARDAR ESTADO
            
            showNotification('Código enviado. Revisa tu correo.', 'success');
            this.renderCodeStep();
            
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
            btnText.classList.remove('hidden');
            btnPreloader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    renderCodeStep() {
        this.container.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h2>Verificación</h2>
                            <p>Ingresa el código de 6 dígitos que enviamos a <strong>${this.email}</strong></p>
                        </div>
                        
                        <form id="forgot-code-form" class="auth-form">
                            <div class="form-group">
                                <label for="reset-code">Código de verificación</label>
                                <input 
                                    type="text" 
                                    id="reset-code" 
                                    name="code" 
                                    placeholder="000000"
                                    maxlength="6"
                                    autocomplete="off"
                                    inputmode="numeric"
                                    pattern="[0-9]{6}"
                                    required
                                >
                                <span class="error-message"></span>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-full">
                                <span class="btn-text">Verificar código</span>
                                <div class="btn-preloader hidden">
                                    <div class="preloader-spinner"></div>
                                    <span>Verificando...</span>
                                </div>
                            </button>
                            
                            <button type="button" id="resend-code-btn" class="btn-resend">
                                Reenviar código
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p><a href="/login" data-link>← Volver al inicio de sesión</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupCodeForm();
    }
    
    setupCodeForm() {
        const form = document.getElementById('forgot-code-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCodeSubmit();
            });
        }
        
        const resendBtn = document.getElementById('resend-code-btn');
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                await this.resendCode();
            });
        }
        
        const codeInput = document.getElementById('reset-code');
        if (codeInput) {
            codeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
            });
        }
    }
    
    async handleCodeSubmit() {
        const codeInput = document.getElementById('reset-code');
        const code = codeInput.value.trim();
        const submitBtn = document.querySelector('#forgot-code-form button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnPreloader = submitBtn.querySelector('.btn-preloader');
        
        if (!code || code.length !== 6) {
            showNotification('Ingresa el código de 6 dígitos', 'error');
            return;
        }
        
        btnText.classList.add('hidden');
        btnPreloader.classList.remove('hidden');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.email, code })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Código inválido');
            }
            
            this.resetToken = data.token;
            this.step = 3;
            this.saveState(); // 🔥 GUARDAR ESTADO
            
            showNotification('Código verificado', 'success');
            this.renderNewPasswordStep();
            
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
            btnText.classList.remove('hidden');
            btnPreloader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    async resendCode() {
        const resendBtn = document.getElementById('resend-code-btn');
        const originalText = resendBtn.textContent;
        resendBtn.disabled = true;
        resendBtn.textContent = 'Enviando...';
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al reenviar');
            }
            
            showNotification('Nuevo código enviado', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = originalText;
            
            let seconds = 60;
            const interval = setInterval(() => {
                seconds--;
                resendBtn.textContent = `Reenviar código (${seconds}s)`;
                if (seconds <= 0) {
                    clearInterval(interval);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Reenviar código';
                }
            }, 1000);
        }
    }
    
    renderNewPasswordStep() {
        this.container.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h2>Nueva Contraseña</h2>
                            <p>Crea una contraseña segura</p>
                        </div>
                        
                        <form id="reset-password-form" class="auth-form">
                            <div class="form-group">
                                <label for="new-password">Nueva contraseña</label>
                                <div class="password-wrapper">
                                    <input 
                                        type="password" 
                                        id="new-password" 
                                        name="password" 
                                        placeholder="••••••"
                                        required
                                        autocomplete="new-password"
                                    >
                                    <button type="button" class="password-toggle" data-target="new-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div id="password-strength" class="password-strength">
                                    <div class="strength-bars">
                                        <div class="strength-bar"></div>
                                        <div class="strength-bar"></div>
                                        <div class="strength-bar"></div>
                                        <div class="strength-bar"></div>
                                        <div class="strength-bar"></div>
                                    </div>
                                    <span id="strength-text" class="strength-text"></span>
                                </div>
                                <div class="password-requirements">
                                    <div id="req-length" class="req-item">
                                        <i class="fas fa-circle"></i> Mínimo 8 caracteres
                                    </div>
                                    <div id="req-upper" class="req-item">
                                        <i class="fas fa-circle"></i> Una letra mayúscula
                                    </div>
                                    <div id="req-lower" class="req-item">
                                        <i class="fas fa-circle"></i> Una letra minúscula
                                    </div>
                                    <div id="req-number" class="req-item">
                                        <i class="fas fa-circle"></i> Un número
                                    </div>
                                    <div id="req-special" class="req-item">
                                        <i class="fas fa-circle"></i> Un carácter especial (!@#$%^&*)
                                    </div>
                                    <div id="req-common" class="req-item">
                                        <i class="fas fa-circle"></i> No sea una contraseña común
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirm-password">Confirmar contraseña</label>
                                <div class="password-wrapper">
                                    <input 
                                        type="password" 
                                        id="confirm-password" 
                                        name="confirm_password" 
                                        placeholder="••••••"
                                        required
                                        autocomplete="new-password"
                                    >
                                    <button type="button" class="password-toggle" data-target="confirm-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <span class="error-message" id="confirm-error"></span>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-full" id="reset-submit" disabled>
                                <span class="btn-text">Restablecer contraseña</span>
                                <div class="btn-preloader hidden">
                                    <div class="preloader-spinner"></div>
                                    <span>Actualizando...</span>
                                </div>
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p><a href="/login" data-link>← Volver al inicio de sesión</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupNewPasswordForm();
    }
    
    setupNewPasswordForm() {
        const passwordInput = document.getElementById('new-password');
        const confirmInput = document.getElementById('confirm-password');
        const confirmError = document.getElementById('confirm-error');
        const submitBtn = document.getElementById('reset-submit');
        
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    const type = targetInput.type === 'password' ? 'text' : 'password';
                    targetInput.type = type;
                    btn.querySelector('i').classList.toggle('fa-eye');
                    btn.querySelector('i').classList.toggle('fa-eye-slash');
                }
            });
        });
        
        const strengthElements = {
            strengthBars: document.querySelectorAll('#password-strength .strength-bar'),
            strengthText: document.getElementById('strength-text'),
            reqLength: document.getElementById('req-length'),
            reqUpper: document.getElementById('req-upper'),
            reqLower: document.getElementById('req-lower'),
            reqNumber: document.getElementById('req-number'),
            reqSpecial: document.getElementById('req-special'),
            reqCommon: document.getElementById('req-common')
        };
        
        const validateForm = () => {
            const password = passwordInput.value;
            const confirm = confirmInput.value;
            
            const { requirements } = checkPasswordStrength(password);
            
            let score = 0;
            if (requirements.length) score++;
            if (requirements.upper) score++;
            if (requirements.lower) score++;
            if (requirements.number) score++;
            if (requirements.special) score++;
            if (requirements.common) score++;
            
            strengthElements.strengthBars.forEach((bar, index) => {
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
            
            if (strengthElements.strengthText) {
                if (password.length === 0) {
                    strengthElements.strengthText.textContent = '';
                    strengthElements.strengthText.className = 'strength-text';
                } else if (score <= 2) {
                    strengthElements.strengthText.textContent = 'Contraseña débil';
                    strengthElements.strengthText.className = 'strength-text strength-weak';
                } else if (score === 3) {
                    strengthElements.strengthText.textContent = 'Contraseña media';
                    strengthElements.strengthText.className = 'strength-text strength-medium';
                } else if (score === 4) {
                    strengthElements.strengthText.textContent = 'Contraseña fuerte';
                    strengthElements.strengthText.className = 'strength-text strength-strong';
                } else if (score >= 5) {
                    strengthElements.strengthText.textContent = 'Contraseña muy fuerte';
                    strengthElements.strengthText.className = 'strength-text strength-very-strong';
                }
            }
            
            const updateReqIcon = (element, isValid) => {
                if (element) {
                    const icon = element.querySelector('i');
                    if (isValid) {
                        element.classList.add('valid');
                        if (icon) {
                            icon.className = 'fas fa-check-circle';
                            icon.style.color = '#4CAF50';
                        }
                    } else {
                        element.classList.remove('valid');
                        if (icon) {
                            icon.className = 'fas fa-circle';
                            icon.style.color = '';
                        }
                    }
                }
            };
            
            updateReqIcon(strengthElements.reqLength, requirements.length);
            updateReqIcon(strengthElements.reqUpper, requirements.upper);
            updateReqIcon(strengthElements.reqLower, requirements.lower);
            updateReqIcon(strengthElements.reqNumber, requirements.number);
            updateReqIcon(strengthElements.reqSpecial, requirements.special);
            updateReqIcon(strengthElements.reqCommon, requirements.common);
            
            const passwordsMatch = password === confirm && password.length > 0;
            
            if (confirm && password !== confirm) {
                confirmError.textContent = '❌ Las contraseñas no coinciden';
                confirmError.style.display = 'block';
            } else {
                confirmError.textContent = '';
                confirmError.style.display = 'none';
            }
            
            const isStrong = score >= 4;
            submitBtn.disabled = !(isStrong && passwordsMatch && password.length > 0);
        };
        
        passwordInput.addEventListener('input', validateForm);
        confirmInput.addEventListener('input', validateForm);
        validateForm();
        
        const form = document.getElementById('reset-password-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleResetSubmit();
            });
        }
    }
    
    async handleResetSubmit() {
        const password = document.getElementById('new-password').value;
        const submitBtn = document.getElementById('reset-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnPreloader = submitBtn.querySelector('.btn-preloader');
        
        btnText.classList.add('hidden');
        btnPreloader.classList.remove('hidden');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.email,
                    token: this.resetToken,
                    newPassword: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al restablecer contraseña');
            }
            
            // 🔥 LIMPIAR ESTADO AL TERMINAR EXITOSAMENTE
            this.clearState();
            
            showNotification('Contraseña actualizada correctamente', 'success');
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
            btnText.classList.remove('hidden');
            btnPreloader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    destroy() {
        // No limpiar el estado al destruir la vista, solo al completar o si el usuario navega manualmente
    }
}