/**
 * Router SPA - Manejo de navegación entre vistas
 */

import { config } from './config.js';
import { authGuard } from './authGuard.js';

// Definición de rutas
const routes = {
    '/': {
        title: 'Inicio',
        view: () => import('./modules/home/home.js'),
        public: true
    },
    '/tienda': {
        title: 'Tienda',
        view: () => import('./modules/products/shop.js'),
        public: true
    },
    '/producto/:id': {
        title: 'Producto',
        view: () => import('./modules/products/productDetail.js'),
        public: true
    },
    '/carrito': {
        title: 'Carrito',
        view: () => import('./modules/cart/cart.js'),
        public: true
    },
    '/checkout': {
        title: 'Finalizar Compra',
        view: () => import('./modules/checkout/checkout.js'),
        public: false,
        roles: ['user', 'admin']
    },
    '/mis-pedidos': {
        title: 'Mis Pedidos',
        view: () => import('./modules/orders/orders.js'),
        public: false,
        roles: ['user', 'admin']
    },
    '/pedido/:id': {
        title: 'Seguimiento de Pedido',
        view: () => import('./modules/orders/orderTracking.js'),
        public: false,
        roles: ['user', 'admin']
    },
    '/mi-cuenta': {
        title: 'Mi Cuenta',
        view: () => import('./modules/users/profile/profile.js'),
        public: false,
        roles: ['user', 'admin']
    },
    '/admin': {
        title: 'Panel Administrativo',
        view: () => import('./modules/admin/dashboard/adminDashboard.js'),
        public: false,
        roles: ['admin']
    },
    '/login': {
        title: 'Iniciar Sesión',
        view: () => import('./modules/auth/login.js'),
        public: true,
        guestOnly: true
    },
    '/registro': {
        title: 'Registrarse',
        view: () => import('./modules/auth/register.js'),
        public: true,
        guestOnly: true
    },
    '/404': {
        title: 'Página no encontrada',
        view: () => import('./modules/errors/notFound.js'),
        public: true
    }
};

class Router {
    constructor() {
        this.currentRoute = null;
        this.currentView = null;
        this.container = document.getElementById('app');
        this.routes = routes;
    }
    
    /**
     * Inicializa el router
     */
    init() {
        // Escuchar cambios en el historial
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
        
        // Manejar clics en enlaces internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('//')) {
                    this.navigate(href);
                }
            }
        });
        
        // Manejar ruta inicial
        this.handleRoute(window.location.pathname);
        
        console.log('🛣️ Router inicializado');
    }
    
    /**
     * Navega a una ruta
     * @param {string} path - Ruta destino
     * @param {boolean} replace - Si reemplaza en historial
     */
    navigate(path, replace = false) {
        const fullPath = path.startsWith('/') ? path : '/' + path;
        
        if (replace) {
            window.history.replaceState(null, '', fullPath);
        } else {
            window.history.pushState(null, '', fullPath);
        }
        
        this.handleRoute(fullPath);
    }
    
    /**
     * Maneja la ruta actual
     * @param {string} path - Ruta a procesar
     */
    async handleRoute(path) {
        // Remover query string y hash
        const cleanPath = path.split('?')[0].split('#')[0];
        
        // Buscar ruta que coincida
        let route = null;
        let params = {};
        
        // Buscar coincidencia exacta o con parámetros
        for (const [pattern, routeConfig] of Object.entries(this.routes)) {
            const match = this.matchRoute(pattern, cleanPath);
            if (match) {
                route = routeConfig;
                params = match;
                break;
            }
        }
        
        // Si no se encuentra, usar 404
        if (!route) {
            route = this.routes['/404'];
        }
        
        // Verificar permisos
        if (!route.public) {
            const hasAccess = await authGuard.checkAccess(route);
            if (!hasAccess) {
                this.navigate('/login');
                return;
            }
        }
        
        // Verificar si es solo para invitados
        if (route.guestOnly && authGuard.isAuthenticated()) {
            this.navigate('/');
            return;
        }
        
        // Mostrar loader
        this.showLoader();
        
        try {
            // Cargar la vista
            const module = await route.view();
            const ViewComponent = module.default || module;
            
            // Actualizar título
            document.title = `${route.title} | ${config.APP_NAME}`;
            
            // Renderizar vista
            if (this.currentView && typeof this.currentView.destroy === 'function') {
                this.currentView.destroy();
            }
            
            this.currentView = new ViewComponent(this.container, params);
            await this.currentView.render();
            
            this.currentRoute = {
                path: cleanPath,
                route: route,
                params: params
            };
            
            // Scroll al inicio
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error('Error loading route:', error);
            this.showError('Error al cargar la página');
        } finally {
            this.hideLoader();
        }
    }
    
    /**
     * Compara una ruta con un patrón
     * @param {string} pattern - Patrón de ruta
     * @param {string} path - Ruta real
     * @returns {object|null} Parámetros encontrados o null
     */
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                return null;
            }
        }
        
        return params;
    }
    
    /**
     * Muestra loader mientras carga vista
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'route-loader';
        loader.className = 'route-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        this.container?.appendChild(loader);
    }
    
    /**
     * Oculta loader
     */
    hideLoader() {
        const loader = document.getElementById('route-loader');
        if (loader) {
            loader.remove();
        }
    }
    
    /**
     * Muestra error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'route-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="location.reload()">Reintentar</button>
        `;
        this.container?.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    /**
     * Obtiene la ruta actual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}

export const router = new Router();