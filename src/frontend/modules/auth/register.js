/**
 * Módulo Register - Registro de usuarios
 * Con validaciones de fortaleza de contraseña y preloader
 */

import { authGuard } from '../../authGuard.js';
import { showNotification } from '../notifications/notifications.js';

export default class RegisterView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.form = null;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="auth-page">
                <div class="auth-container register auth-form-register">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h2>Crear Cuenta</h2>
                            <p>Regístrate para comenzar a comprar</p>
                        </div>
                        
                        <form id="register-form" class="auth-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="name">Nombre completo</label>
                                    <input type="text" id="name" name="name" placeholder="Juan Pérez" required>
                                    <span class="error-message"></span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="phone">Teléfono</label>
                                    <input type="tel" id="phone" name="phone" placeholder="669 123 4567">
                                </div>
                                
                                <div class="form-group full-width">
                                    <label for="email">Correo electrónico</label>
                                    <input type="email" id="email" name="email" placeholder="tu@email.com" required>
                                    <span class="error-message"></span>
                                </div>
                                
                                <div class="form-group full-width">
                                    <label for="password">Contraseña</label>
                                    <input type="password" id="password" name="password" placeholder="Mínimo 8 caracteres" required>
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
                                
                                <div class="form-group full-width">
                                    <label for="confirm-password">Confirmar contraseña</label>
                                    <input type="password" id="confirm-password" name="confirm-password" placeholder="Repite tu contraseña" required>
                                    <span class="error-message"></span>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-full" id="register-submit" disabled>
                                <span class="btn-text">Registrarse</span>
                                <div class="btn-preloader hidden">
                                    <div class="preloader-spinner"></div>
                                    <span>Procesando...</span>
                                </div>
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p>¿Ya tienes cuenta? <a href="/login" data-link>Inicia sesión aquí</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupForm();
        this.setupPasswordValidation();
        
        return this;
    }
    
    /**
     * Lista de contraseñas comunes a bloquear
     */
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
    
    /**
     * Verifica si es una contraseña común
     */
    isCommonPassword(password) {
        const common = this.getCommonPasswords();
        const lowerPassword = password.toLowerCase();
        return common.includes(lowerPassword);
    }
    
    /**
     * Verifica fortaleza de la contraseña
     */
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
    
    /**
     * Actualiza la UI de fortaleza de contraseña
     */
    updateStrengthUI(password) {
        const { score, requirements } = this.checkPasswordStrength(password);
        const strengthBars = document.querySelectorAll('.strength-bar');
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
        
        const submitBtn = document.getElementById('register-submit');
        const isPasswordValid = requirements.length && requirements.upper && 
                                requirements.lower && requirements.number && 
                                requirements.special && requirements.common;
        const confirmPassword = document.getElementById('confirm-password');
        const passwordsMatch = confirmPassword.value === password;
        
        if (submitBtn) {
            submitBtn.disabled = !(isPasswordValid && passwordsMatch && password.length > 0);
        }
        
        return requirements;
    }
    
    /**
     * Actualiza el ícono de un requisito
     */
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
    
    /**
     * Configura la validación de contraseña en tiempo real
     */
    setupPasswordValidation() {
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirm-password');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                this.updateStrengthUI(password);
                if (confirmInput.value) {
                    this.validatePasswordMatch();
                }
            });
        }
        
        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                this.validatePasswordMatch();
                const password = passwordInput?.value || '';
                const requirements = this.checkPasswordStrength(password);
                const isPasswordValid = requirements.requirements.length && 
                                        requirements.requirements.upper && 
                                        requirements.requirements.lower && 
                                        requirements.requirements.number && 
                                        requirements.requirements.special && 
                                        requirements.requirements.common;
                const submitBtn = document.getElementById('register-submit');
                if (submitBtn) {
                    submitBtn.disabled = !(isPasswordValid && this.validatePasswordMatch() && password.length > 0);
                }
            });
        }
    }
    
    /**
     * Valida que las contraseñas coincidan
     */
    validatePasswordMatch() {
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirm-password')?.value || '';
        const confirmError = document.getElementById('confirm-password')?.parentElement?.querySelector('.error-message');
        
        if (confirmPassword && password !== confirmPassword) {
            if (confirmError) {
                confirmError.textContent = 'Las contraseñas no coinciden';
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
    
    setupForm() {
        this.form = document.getElementById('register-form');
        
        if (this.form) {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit();
            });
        }
    }
    
    async handleSubmit() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (name.length < 3) {
            showNotification('El nombre debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Ingresa un correo electrónico válido', 'error');
            return;
        }
        
        if (phone && !/^[0-9]{8,12}$/.test(phone.replace(/[\s-]/g, ''))) {
            showNotification('Ingresa un número de teléfono válido (8-12 dígitos)', 'error');
            return;
        }
        
        const { score, requirements } = this.checkPasswordStrength(password);
        
        if (score < 5) {
            let errorMsg = 'La contraseña es demasiado débil. Requisitos faltantes: ';
            const missing = [];
            if (!requirements.length) missing.push('mínimo 8 caracteres');
            if (!requirements.upper) missing.push('una mayúscula');
            if (!requirements.lower) missing.push('una minúscula');
            if (!requirements.number) missing.push('un número');
            if (!requirements.special) missing.push('un carácter especial');
            if (!requirements.common) missing.push('no puede ser una contraseña común');
            showNotification(errorMsg + missing.join(', '), 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnPreloader = submitBtn.querySelector('.btn-preloader');
        
        // Mostrar preloader
        btnText.classList.add('hidden');
        btnPreloader.classList.remove('hidden');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar usuario');
            }
            
            const loggedIn = await authGuard.login(data.user, data.token);
            
            if (loggedIn) {
                showNotification('¡Registro exitoso! Bienvenido', 'success');
                window.location.href = '/';
            }
            
        } catch (error) {
            console.error('Register error:', error);
            showNotification(error.message, 'error');
            btnText.classList.remove('hidden');
            btnPreloader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    destroy() {
        if (this.form) {
            this.form.removeEventListener('submit', this.handleSubmit);
        }
    }
}