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
    '/beneficios': {
        title: 'Beneficios',
        view: () => import('./modules/benefits/beneficios.js'),
        public: true
    },
    '/blog': {
        title: 'Blog',
        view: () => import('./modules/blog/blog.js'),
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
    '/suscripcion': {
        title: 'Suscripcion',
        view: () => import('./modules/suscripcion/suscripcion.js'),
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
    
    init() {
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
        
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
        
        this.handleRoute(window.location.pathname);
        console.log('🛣️ Router inicializado');
    }
    
    navigate(path, replace = false) {
        const fullPath = path.startsWith('/') ? path : '/' + path;
        
        if (replace) {
            window.history.replaceState(null, '', fullPath);
        } else {
            window.history.pushState(null, '', fullPath);
        }
        
        this.handleRoute(fullPath);
        
        window.dispatchEvent(new CustomEvent('router-navigate', { 
            detail: { path: fullPath }
        }));
    }
    
    async handleRoute(path) {
        const cleanPath = path.split('?')[0].split('#')[0];
        
        let route = null;
        let params = {};
        
        for (const [pattern, routeConfig] of Object.entries(this.routes)) {
            const match = this.matchRoute(pattern, cleanPath);
            if (match) {
                route = routeConfig;
                params = match;
                break;
            }
        }
        
        if (!route) {
            route = this.routes['/404'];
        }
        
        if (!route.public) {
            const hasAccess = await authGuard.checkAccess(route);
            if (!hasAccess) {
                this.navigate('/login');
                return;
            }
        }
        
        if (route.guestOnly && authGuard.isAuthenticated()) {
            this.navigate('/');
            return;
        }
        
        this.showLoader();
        
        try {
            const module = await route.view();
            const ViewComponent = module.default || module;
            
            document.title = `${route.title} | ${config.APP_NAME}`;
            
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
            
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error('Error loading route:', error);
            this.showError('Error al cargar la página');
        } finally {
            this.hideLoader();
        }
    }
    
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
    
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'route-loader';
        loader.className = 'route-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        this.container?.appendChild(loader);
    }
    
    hideLoader() {
        const loader = document.getElementById('route-loader');
        if (loader) {
            loader.remove();
        }
    }
    
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
    
    getCurrentRoute() {
        return this.currentRoute;
    }
}

export const router = new Router();