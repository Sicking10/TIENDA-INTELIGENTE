/**
 * Router SPA - Manejo de navegación entre vistas
 * router.js
 * CORREGIDO - Ignora clics en botones
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
        view: () => import('./modules/orders/tracking/orderTracking.js'),
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
    '/faq': {
        title: 'Preguntas Frecuentes',
        view: () => import('./modules/faq/faq.js'),
        public: true
    },
    '/contacto': {
        title: 'Contacto',
        view: () => import('./modules/contacto/contacto.js'),
        public: true
    },
    '/terminos': {
        title: 'Términos y Condiciones',
        view: () => import('./modules/legal/legal.js'),
        public: true
    },
    '/privacidad': {
        title: 'Política de Privacidad',
        view: () => import('./modules/legal/legal.js'),
        public: true
    },
    '/garantia': {
        title: 'Garantía',
        view: () => import('./modules/legal/legal.js'),
        public: true
    },
    '/forgot-password': {
        title: 'Recuperar Contraseña',
        view: () => import('./modules/auth/forgotPassword.js'),
        public: true,
        guestOnly: true
    },
    // Rutas de administrador
    '/admin': {
        title: 'Dashboard',
        view: () => import('./modules/admin/dashboard/adminDashboard.js'),
        public: false,
        roles: ['admin', 'superadmin']
    },
    '/admin/productos': {
        title: 'Gestionar Productos',
        view: () => import('./modules/admin/products/adminProducts.js'),
        public: false,
        roles: ['admin', 'superadmin']
    },
    '/admin/blog': {
        title: 'Gestionar Blog',
        view: () => import('./modules/admin/blog/adminBlog.js'),
        public: false,
        roles: ['admin', 'superadmin']
    },
    '/admin/usuarios': {
        title: 'Gestionar Usuarios',
        view: () => import('./modules/admin/users/adminUsers.js'),
        public: false,
        roles: ['admin', 'superadmin']
    },
    '/admin/pedidos': {
        title: 'Gestionar Pedidos',
        view: () => import('./modules/admin/orders/adminOrders.js'),
        public: false,
        roles: ['admin', 'superadmin']
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

    async handleRouteFromInit(path) {
        // Igual que handleRoute pero sin tocar el historial
        await this.handleRoute(path);
    }

    init() {
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });

        document.addEventListener('click', (e) => {
            // Ignorar si el clic fue en un botón o dentro de uno
            let target = e.target;
            while (target && target !== document.body) {
                if (target.tagName === 'BUTTON') {
                    console.log('🔘 Clic en botón ignorado por router:', target.id || target.className);
                    return; // Salir completamente, no procesar como navegación
                }
                target = target.parentElement;
            }

            // Ignorar si el elemento o su ancestro tiene data-no-router
            if (e.target.closest('[data-no-router]')) return;

            const link = e.target.closest('a[data-link]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;
            if (href.startsWith('http') || href.startsWith('//')) return;
            if (href.startsWith('#')) return;

            e.preventDefault();
            e.stopPropagation();
            this.navigate(href);
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