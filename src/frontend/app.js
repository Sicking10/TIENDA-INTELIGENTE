/**
 * Tienda Inteligente de Comida - SPA
 * Archivo principal de inicialización
 * @version 1.0.0
 */

// Importación de módulos principales
import { router } from './router.js';
import { store } from './store.js';
import { config } from './config.js';
import { setupEventDelegation } from './utils/domEvents.js';
import { authGuard } from './authGuard.js';
import { initTheme } from './utils/theme.js';
import { initNotifications } from './modules/notifications/notifications.js';
import { updateCartBadge } from './utils/cartUtils.js';

// Estado de la aplicación
let appInitialized = false;

/**
 * Elimina el loader inicial de la pantalla
 */
function hideInitialLoader() {
    const loader = document.getElementById('initial-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}

/**
 * Muestra mensaje de error crítico en la app
 * @param {string} message - Mensaje de error
 */
function showCriticalError(message) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div class="critical-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Error al iniciar la aplicación</h2>
                <p>${message}</p>
                <button onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

/**
 * Inicializa los servicios esenciales de la aplicación
 */
async function initializeServices() {
    // Verificar conectividad con el backend
    try {
        const response = await fetch(`${config.API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Backend no disponible');
        }
        
        const healthData = await response.json();
        console.log('✅ Backend conectado:', healthData);
        
    } catch (error) {
        console.error('❌ Error de conexión con backend:', error);
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
}

/**
 * Configura el tema visual según preferencias del usuario o sistema
 */
function setupTheme() {
    // Cargar tema guardado o detectar sistema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Escuchar cambios en el sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Renderiza la barra de navegación GINGER
 */
function renderNavbar() {
    if (document.querySelector('.navbar-ginger')) return;
    
    const navbar = document.createElement('nav');
    navbar.className = 'navbar-ginger';
    navbar.innerHTML = `
        <div class="navbar-container">
            <a href="/" class="navbar-logo" data-link>
                <div class="logo-icon">
                    <i class="fas fa-leaf"></i>
                </div>
                <div class="logo-text">GINGER<span>caps</span></div>
            </a>
            
            <div class="navbar-center">
                <div class="navbar-links" id="navbar-links">
                    <a href="/" class="nav-link" data-link>Inicio</a>
                    <a href="/tienda" class="nav-link" data-link>Productos</a>
                    <a href="/beneficios" class="nav-link" data-link>Beneficios</a>
                    <a href="/blog" class="nav-link" data-link>Blog</a>
                </div>
            </div>
            
            <div class="navbar-actions">
                <a href="/carrito" class="cart-icon" data-link>
                    <i class="fas fa-shopping-bag"></i>
                    <span class="cart-badge" id="cart-badge">0</span>
                </a>
                
                <div class="user-menu" style="display: none;">
                    <div class="user-avatar" id="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-dropdown" id="user-dropdown">
                        <div class="dropdown-header">
                            <h4 id="user-name">Invitado</h4>
                            <p id="user-email">Descubre los beneficios del jengibre</p>
                        </div>
                        <div class="dropdown-divider"></div>
                        <a href="/mi-cuenta" class="dropdown-item" data-link>
                            <i class="fas fa-user"></i> Mi perfil
                        </a>
                        <a href="/mis-pedidos" class="dropdown-item" data-link>
                            <i class="fas fa-receipt"></i> Mis pedidos
                        </a>
                        <a href="/suscripcion" class="dropdown-item" data-link>
                            <i class="fas fa-calendar-alt"></i> Suscripción
                        </a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item btn-logout" id="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                        </button>
                    </div>
                </div>
                
                <div class="auth-buttons" id="auth-buttons">
                    <a href="/login" class="btn-nav-login" data-link>Ingresar</a>
                    <a href="/registro" class="btn-nav-register" data-link>Comenzar</a>
                </div>
                
                <button class="mobile-menu-btn" id="mobile-menu-btn">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.insertBefore(navbar, document.body.firstChild);
    
    // Configurar menú móvil
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navbarLinks = document.getElementById('navbar-links');
    if (mobileBtn && navbarLinks) {
        mobileBtn.addEventListener('click', () => {
            navbarLinks.classList.toggle('mobile-open');
        });
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            store.logout();
            authGuard.logout();
            window.location.href = '/';
        });
    }
    
    // Actualizar badge del carrito
    updateCartBadge();
    
    // Actualizar estado de autenticación en navbar
    setTimeout(() => {
        store.updateNavbarAuth();
    }, 100);
}

/**
 * Inicializa la aplicación principal
 */
async function initApp() {
    try {
        console.log('🚀 Inicializando GINGERcaps...');
        
        // 1. Configurar tema
        setupTheme();
        
        // 2. Renderizar navbar
        renderNavbar();
        
        // 3. Inicializar servicios esenciales
        await initializeServices();
        
        // 4. Configurar el store global
        store.init();
        
        // 5. Configurar el router
        router.init();
        
        // 6. Configurar sistema de notificaciones
        initNotifications();
        
        // 7. Configurar delegación de eventos global
        setupEventDelegation();
        
        // 8. Verificar autenticación y cargar vista inicial
        const initialPath = authGuard.getInitialPath();
        router.navigate(initialPath);
        
        // 9. Ocultar loader
        hideInitialLoader();
        
        appInitialized = true;
        console.log('✅ GINGERcaps inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        showCriticalError(error.message || 'Error desconocido al iniciar la aplicación');
    }
}

/**
 * Limpieza antes de cerrar la app
 */
function cleanup() {
    if (appInitialized) {
        console.log('🔄 Limpiando recursos de la aplicación...');
    }
}

// Escuchar evento de cierre/recarga
window.addEventListener('beforeunload', cleanup);

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exportar utilidades para debugging en consola (solo desarrollo)
if (config.DEBUG) {
    window.__APP__ = {
        store,
        router,
        config,
        version: '1.0.0'
    };
    console.log('🐛 Modo desarrollo: __APP__ disponible en consola');
}