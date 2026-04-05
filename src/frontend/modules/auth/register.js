/**
 * Módulo Register - Registro de usuarios
 * Con validaciones de fortaleza de contraseña y preloader
 */

import { authGuard } from '../../authGuard.js';
import { showNotification } from '../notifications/notifications.js';
import { addPasswordToggle } from '../../utils/passwordToggle.js';
import { 
    checkPasswordStrength, 
    setupPasswordStrengthValidation, 
    validatePasswordMatch,
    getMissingRequirementsMessage
} from '../../utils/passwordStrength.js';

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

        // Agregar toggles de contraseña
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        if (passwordInput) addPasswordToggle(passwordInput);
        if (confirmPasswordInput) addPasswordToggle(confirmPasswordInput);

        // Configurar validación de fortaleza
        setupPasswordStrengthValidation(passwordInput, confirmPasswordInput);
        
        // Configurar validación de coincidencia en tiempo real
        const confirmError = document.getElementById('confirm-password')?.parentElement?.querySelector('.error-message');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                validatePasswordMatch(passwordInput, confirmPasswordInput, confirmError);
            });
        }

        this.setupForm();

        return this;
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

        const { score, requirements } = checkPasswordStrength(password);

        if (score < 5) {
            const missing = getMissingRequirementsMessage(requirements);
            showNotification(`⚠️ Contraseña débil. Requisitos faltantes:\n${missing.join('\n')}`, 'warning', 5000);
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnPreloader = submitBtn.querySelector('.btn-preloader');

        btnText.classList.add('hidden');
        btnPreloader.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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