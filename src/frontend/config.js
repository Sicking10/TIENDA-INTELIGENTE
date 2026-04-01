/**
 * Configuración global del frontend
 * Versión sin bundler - usa variables de entorno del servidor
 */

// Detectar entorno basado en el hostname
const getEnvironment = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    
    // Puedes agregar más condiciones para staging/producción
    if (hostname.includes('staging')) {
        return 'staging';
    }
    
    return 'production';
};

const ENV = getEnvironment();

// Configuración por entorno
const configs = {
    development: {
        API_URL: 'http://localhost:3000/api',
        WS_URL: 'ws://localhost:3000',
        DEBUG: true,
        APP_NAME: 'Tienda Inteligente (Dev)'
    },
    staging: {
        API_URL: 'https://staging-api.tiendainteligente.com/api',
        WS_URL: 'wss://staging-api.tiendainteligente.com',
        DEBUG: true,
        APP_NAME: 'Tienda Inteligente (Staging)'
    },
    production: {
        API_URL: 'https://api.tiendainteligente.com/api',
        WS_URL: 'wss://api.tiendainteligente.com',
        DEBUG: false,
        APP_NAME: 'Tienda Inteligente'
    }
};

export const config = {
    ...configs[ENV],
    ENV,
    VERSION: '1.0.0',
    
    // Límites y configuraciones
    LIMITS: {
        MAX_CART_ITEMS: 50,
        MAX_PRODUCT_QUANTITY: 99,
        MIN_ORDER_AMOUNT: 0,
        MAX_UPLOAD_SIZE_MB: 5
    },
    
    // Tiempos en milisegundos
    TIMEOUTS: {
        API_REQUEST: 30000,
        NOTIFICATION_DURATION: 5000,
        CART_EXPIRY: 86400000 // 24 horas
    },
    
    // Rutas de la aplicación
    ROUTES: {
        HOME: '/',
        SHOP: '/tienda',
        PRODUCT: '/producto/:id',
        CART: '/carrito',
        CHECKOUT: '/checkout',
        ORDERS: '/mis-pedidos',
        ORDER_TRACKING: '/pedido/:id',
        ACCOUNT: '/mi-cuenta',
        ADMIN: '/admin',
        LOGIN: '/login',
        REGISTER: '/registro'
    }
};

// Si estás en desarrollo, expone la configuración en consola
if (ENV === 'development') {
    console.log('🔧 Configuración cargada:', { ENV, API_URL: config.API_URL });
}

export default config;