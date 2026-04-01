/**
 * Módulo Login - Inicio de sesión
 */

import { authGuard } from '../../authGuard.js';
import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';

export default class LoginView {
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
                            <h2>Iniciar Sesión</h2>
                            <p>Bienvenido de vuelta</p>
                        </div>
                        
                        <form id="login-form" class="auth-form">
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
                                <label for="password">Contraseña</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••"
                                    required
                                    data-validate="required,min:6"
                                >
                                <span class="error-message"></span>
                            </div>
                            
                            <div class="form-options">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="remember"> Recordarme
                                </label>
                                <a href="/forgot-password" data-link class="forgot-link">¿Olvidaste tu contraseña?</a>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-full">
                                <span class="btn-text">Iniciar Sesión</span>
                                <span class="btn-loader hidden">Cargando...</span>
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p>¿No tienes cuenta? <a href="/registro" data-link>Regístrate aquí</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configurar evento del formulario
        this.setupForm();
        
        return this;
    }
    
    setupForm() {
        this.form = document.getElementById('login-form');
        
        if (this.form) {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit();
            });
        }
    }
    
    async handleSubmit() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Mostrar loader
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }
            
            // Guardar sesión
            const loggedIn = await authGuard.login(data.user, data.token);
            
            if (loggedIn) {
                showNotification('Inicio de sesión exitoso', 'success');
                
                // Redirigir según rol
                const role = authGuard.getUserRole();
                if (role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            }
            
        } catch (error) {
            console.error('Login error:', error);
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