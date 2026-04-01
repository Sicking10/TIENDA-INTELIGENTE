/**
 * Auth Guard - Protección de rutas y verificación de autenticación
 */

import { store } from './store.js';
import { config } from './config.js';

class AuthGuard {
    constructor() {
        this.tokenRefreshInterval = null;
    }
    
    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        const token = store.get('auth.token');
        if (!token) return false;
        
        // Verificar expiración del token
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expired = payload.exp * 1000 < Date.now();
            
            if (expired) {
                this.logout();
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return store.get('auth.user');
    }
    
    /**
     * Obtiene el rol del usuario
     */
    getUserRole() {
        return store.get('auth.role');
    }
    
    /**
     * Verifica si el usuario tiene un rol específico
     * @param {string|array} roles - Rol o roles permitidos
     */
    hasRole(roles) {
        const userRole = this.getUserRole();
        if (!userRole) return false;
        
        if (Array.isArray(roles)) {
            return roles.includes(userRole);
        }
        
        return userRole === roles;
    }
    
    /**
     * Verifica acceso a una ruta
     * @param {object} route - Configuración de la ruta
     */
    async checkAccess(route) {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        if (route.roles && !this.hasRole(route.roles)) {
            store.notify('No tienes permisos para acceder a esta página', 'error');
            return false;
        }
        
        return true;
    }
    
    /**
     * Obtiene la ruta inicial según autenticación
     */
    getInitialPath() {
        if (this.isAuthenticated()) {
            const role = this.getUserRole();
            if (role === 'admin') {
                return '/admin';
            }
            return '/';
        }
        return '/';
    }
    
    /**
     * Inicia sesión
     * @param {object} userData - Datos del usuario
     * @param {string} token - JWT token
     */
    async login(userData, token) {
        try {
            // Decodificar token para obtener rol
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            store.login(userData, token);
            
            // Iniciar refresh de token
            this.startTokenRefresh();
            
            return true;
            
        } catch (error) {
            console.error('Login error:', error);
            store.notify('Error al iniciar sesión', 'error');
            return false;
        }
    }
    
    /**
     * Registra un nuevo usuario
     * @param {object} userData - Datos del usuario
     */
    async register(userData) {
        try {
            const response = await fetch(`${config.API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar');
            }
            
            return this.login(data.user, data.token);
            
        } catch (error) {
            console.error('Register error:', error);
            store.notify(error.message, 'error');
            return false;
        }
    }
    
    /**
     * Cierra sesión
     */
    async logout() {
        try {
            const token = store.get('auth.token');
            if (token) {
                await fetch(`${config.API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.stopTokenRefresh();
            store.logout();
        }
    }
    
    /**
     * Inicia el intervalo de refresh de token
     */
    startTokenRefresh() {
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
        }
        
        // Refrescar cada 10 minutos
        this.tokenRefreshInterval = setInterval(async () => {
            await this.refreshToken();
        }, 10 * 60 * 1000);
    }
    
    /**
     * Detiene el refresh de token
     */
    stopTokenRefresh() {
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
            this.tokenRefreshInterval = null;
        }
    }
    
    /**
     * Refresca el token JWT
     */
    async refreshToken() {
        try {
            const token = store.get('auth.token');
            if (!token) return;
            
            const response = await fetch(`${config.API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            const data = await response.json();
            store.set('auth.token', data.token);
            
        } catch (error) {
            console.error('Token refresh error:', error);
            await this.logout();
        }
    }
    
    /**
     * Verifica si el token está por expirar
     */
    isTokenExpiringSoon() {
        const token = store.get('auth.token');
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const timeUntilExpiry = payload.exp * 1000 - Date.now();
            return timeUntilExpiry < 5 * 60 * 1000;
        } catch {
            return true;
        }
    }
}

export const authGuard = new AuthGuard();