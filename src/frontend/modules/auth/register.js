/**
 * Módulo Register - Registro de usuarios
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
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h2>Crear Cuenta</h2>
                            <p>Regístrate para comenzar a comprar</p>
                        </div>
                        
                        <form id="register-form" class="auth-form">
                            <div class="form-group">
                                <label for="name">Nombre completo</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    placeholder="Juan Pérez"
                                    required
                                    data-validate="required,min:2"
                                >
                                <span class="error-message"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">Correo electrónico</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    placeholder="tu@email.com"
                                    required
                                    data-validate="required,email"
                                >
                                <span class="error-message"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="phone">Teléfono</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    name="phone" 
                                    placeholder="+52 123 456 7890"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Contraseña</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    data-validate="required,min:6"
                                >
                                <span class="error-message"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirm-password">Confirmar contraseña</label>
                                <input 
                                    type="password" 
                                    id="confirm-password" 
                                    name="confirm-password" 
                                    placeholder="Repite tu contraseña"
                                    required
                                >
                                <span class="error-message"></span>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-full">
                                <span class="btn-text">Registrarse</span>
                                <span class="btn-loader hidden">Cargando...</span>
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
        
        return this;
    }
    
    setupForm() {
        this.form = document.getElementById('register-form');
        
        if (this.form) {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit();
            });
            
            // Validar confirmación de contraseña
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirm-password');
            
            confirmPassword.addEventListener('input', () => {
                if (password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Las contraseñas no coinciden');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
    }
    
    async handleSubmit() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validar contraseñas
        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Mostrar loader
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
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
            
            // Iniciar sesión automáticamente
            const loggedIn = await authGuard.login(data.user, data.token);
            
            if (loggedIn) {
                showNotification('¡Registro exitoso! Bienvenido', 'success');
                window.location.href = '/';
            }
            
        } catch (error) {
            console.error('Register error:', error);
            showNotification(error.message, 'error');
            
            // Restaurar botón
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    destroy() {
        if (this.form) {
            this.form.removeEventListener('submit', this.handleSubmit);
        }
    }
}