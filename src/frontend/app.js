/**
 * GINGERcaps SPA — app.js
 * Archivo principal de inicialización
 * @version 2.0.0
 *
 * NOTA: renderNavbar() vive exclusivamente en navbar.js
 * Este archivo solo orquesta la inicialización global.
 */

import { router } from './router.js';
import { store } from './store.js';
import { config } from './config.js';
import { setupEventDelegation } from './utils/domEvents.js';
import { authGuard } from './authGuard.js';
import { initNotifications } from './modules/notifications/notifications.js';
import { renderNavbar, updateNavbarAuth } from './modules/navbar/navbar.js';

/* ─────────────────────────────────────────────
   THEME SETUP
   (runs before paint to avoid flash of wrong theme)
───────────────────────────────────────────── */
function setupTheme() {
    const saved = localStorage.getItem('theme');
    const theme = 'light';

    document.documentElement.setAttribute('data-theme', theme);

    localStorage.setItem('theme', theme);

    /* React to OS-level changes (only when user hasn't overridden) */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

/* ─────────────────────────────────────────────
   INITIAL LOADER
───────────────────────────────────────────── */
function hideInitialLoader() {
    const loader = document.getElementById('initial-loader');
    if (!loader) return;

    loader.style.transition = 'opacity 0.35s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 350);
}

/* ─────────────────────────────────────────────
   CRITICAL ERROR FALLBACK
───────────────────────────────────────────── */
function showCriticalError(message) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="
                display:flex; flex-direction:column; align-items:center;
                justify-content:center; min-height:60vh; padding:40px;
                font-family:'Outfit',sans-serif; text-align:center;
            ">
                <div style="font-size:48px; margin-bottom:16px;">🌿</div>
                <h2 style="
                    font-family:'Cormorant Garamond',serif;
                    font-size:26px; color:#C8651B; margin-bottom:12px;
                ">Error al iniciar GINGERcaps</h2>
                <p style="color:#4A2F1A; max-width:400px; line-height:1.6; margin-bottom:28px;">
                    ${message}
                </p>
                <button
                    onclick="location.reload()"
                    style="
                        padding:12px 28px; background:#C8651B; color:white;
                        border:none; border-radius:100px; font-size:14px;
                        font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif;
                    "
                >
                    Reintentar
                </button>
            </div>
        `;
    }
}

/* ─────────────────────────────────────────────
   BACKEND HEALTH CHECK
───────────────────────────────────────────── */
async function initializeServices() {
    try {
        const response = await fetch(`${config.API_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(8000) // 8s timeout
        });

        if (!response.ok) {
            throw new Error(`Backend respondió con status ${response.status}`);
        }

        const healthData = await response.json();
        console.log('✅ Backend conectado:', healthData);

    } catch (error) {
        console.error('❌ Error de conexión con backend:', error);
        throw new Error(
            'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        );
    }
}

/* ─────────────────────────────────────────────
   STORE AUTH → NAVBAR SYNC
   Escucha cambios de autenticación en el store
   y actualiza la navbar automáticamente.
───────────────────────────────────────────── */
function setupAuthSync() {
    /* Si el store emite eventos personalizados, suscribirse aquí */
    if (typeof store.subscribe === 'function') {
        store.subscribe('auth', () => {
            updateNavbarAuth();
        });
    }
}

/* ─────────────────────────────────────────────
   MAIN INIT
───────────────────────────────────────────── */
let appInitialized = false;

async function initApp() {
    try {
        console.log('🚀 Inicializando GINGERcaps v2…');

        // 1. Aplicar tema antes del primer paint (evita FOUC)
        setupTheme();

        // 2. Inicializar el store global
        store.init();

        // 3. Conectar con el backend
        await initializeServices();

        // 4. Montar la navbar (única fuente de verdad: navbar.js)
        renderNavbar();

        // 5. Sincronizar auth → navbar
        setupAuthSync();

        // 6. Inicializar el router SPA
        router.init();

        // 7. Sistema de notificaciones
        initNotifications();

        // 8. Delegación global de eventos
        setupEventDelegation();

        // 9. Resolver ruta inicial respetando guards
        const currentPath = window.location.pathname;

        // Solo navegar al home si estamos en la raíz exacta
        // Si el usuario llega directo a /checkout, /carrito, etc., respetar esa ruta
        if (currentPath === '/' || currentPath === '') {
            const initialPath = authGuard.getInitialPath();
            router.navigate(initialPath, true); // replace:true para no duplicar historial
        } else {
            // Dejar que el router maneje la ruta actual sin redirigir
            router.handleRoute(currentPath);
        }

        // 10. Ocultar loader
        hideInitialLoader();

        appInitialized = true;
        console.log('✅ GINGERcaps listo');

    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        showCriticalError(error.message || 'Error desconocido al iniciar la aplicación.');
        hideInitialLoader();
    }
}

/* ─────────────────────────────────────────────
   CLEANUP
───────────────────────────────────────────── */
function cleanup() {
    if (appInitialized) {
        console.log('🔄 Limpiando recursos de la aplicación…');
        // Aquí iría la limpieza de WebSockets, timers, etc.
    }
}

window.addEventListener('beforeunload', cleanup);

/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/* ─────────────────────────────────────────────
   DEV TOOLS
───────────────────────────────────────────── */
if (config.DEBUG) {
    window.__APP__ = {
        store,
        router,
        config,
        version: '2.0.0'
    };
    console.log('🐛 Modo desarrollo: window.__APP__ disponible en consola');
}