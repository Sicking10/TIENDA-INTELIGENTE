/**
 * Navbar GINGER — Botanical Apothecary
 * Interactive, animated navigation
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { updateCartBadge } from '../../utils/cartUtils.js';

/**
 * SVG para el emblema del logo (raíz de jengibre estilizada)
 */
function getLogoSVG() {
    return `
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="44" height="44" rx="12" fill="url(#logo-grad)"/>
        <!-- Raíz estilizada -->
        <path d="M22 8 C18 8 14 12 14 17 C14 22 17 25 20 27 L20 36" 
              stroke="rgba(255,255,255,0.9)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M20 20 C23 18 27 20 27 24" 
              stroke="rgba(255,255,255,0.75)" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M20 27 C17 30 15 33 18 36" 
              stroke="rgba(255,255,255,0.65)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <!-- Brotes -->
        <circle cx="22" cy="8" r="2.5" fill="rgba(255,255,255,0.9)"/>
        <circle cx="27" cy="24" r="2" fill="rgba(255,255,255,0.75)"/>
        <circle cx="18" cy="36" r="1.8" fill="rgba(255,255,255,0.65)"/>
        <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="44" y2="44">
                <stop offset="0%" stop-color="#E8834A"/>
                <stop offset="100%" stop-color="#9A4710"/>
            </linearGradient>
        </defs>
    </svg>`;
}

/**
 * Renderiza el HTML completo de la navbar
 */
function getNavbarHTML() {
    return `
        <!-- Progress bar de scroll -->
        <div class="nav-progress" id="nav-progress"></div>

        <div class="navbar-container">
            <!-- Logo -->
            <a href="/" class="navbar-logo" data-link aria-label="GINGERcaps inicio">
                <div class="logo-emblem">
                    ${getLogoSVG()}
                </div>
                <div class="logo-wordmark">
                    <span class="logo-brand">GINGERcaps</span>
                    <span class="logo-tagline">Bienestar Natural</span>
                </div>
            </a>

            <!-- Links centrales -->
            <nav class="navbar-center" aria-label="Navegación principal">
                <div class="navbar-links" id="navbar-links">
                    <a href="/" class="nav-link" data-link>
                        <span class="nav-dot"></span>
                        Inicio
                    </a>
                    <a href="/tienda" class="nav-link" data-link>
                        <span class="nav-dot"></span>
                        Productos
                    </a>
                    <a href="/beneficios" class="nav-link" data-link>
                        <span class="nav-dot"></span>
                        Beneficios
                    </a>
                    <a href="/blog" class="nav-link" data-link>
                        <span class="nav-dot"></span>
                        Blog
                    </a>
                </div>
            </nav>

            <!-- Acciones derecha -->
            <div class="navbar-actions">
                <!-- Ingredient pills (decorativas) -->
                <div class="ingredient-pills" aria-hidden="true">
                    <div class="pill-btn pill-ginger" title="Jengibre">
                        <span class="pill-icon">🫚</span>
                        <span>Jengibre</span>
                    </div>
                    <div class="pill-btn pill-turmeric" title="Cúrcuma">
                        <span class="pill-icon">🌿</span>
                        <span>Cúrcuma</span>
                    </div>
                    <div class="pill-btn pill-chamomile" title="Manzanilla">
                        <span class="pill-icon">🌼</span>
                        <span>Manzanilla</span>
                    </div>
                </div>

                <!-- Toggle tema -->
                <button class="theme-toggle" id="theme-toggle" aria-label="Cambiar tema">
                    <span id="theme-icon">🌙</span>
                </button>

                <!-- Carrito -->
                <a href="/carrito" class="cart-btn" data-link aria-label="Carrito de compras">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    <span class="cart-badge" id="cart-badge">0</span>
                </a>

                <!-- User menu (cuando está autenticado) -->
                <div class="user-menu" id="user-menu" style="display:none;">
                    <button class="user-avatar-btn" id="user-avatar-btn" aria-expanded="false">
                        <div class="avatar-circle" id="avatar-initials">U</div>
                        <span class="avatar-label" id="avatar-label">Mi cuenta</span>
                        <svg class="avatar-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                    <div class="user-dropdown" id="user-dropdown">
                        <div class="dropdown-top">
                            <div class="dropdown-user-name" id="dropdown-name">Usuario</div>
                            <div class="dropdown-user-email" id="dropdown-email">usuario@email.com</div>
                        </div>
                        <div class="dropdown-nav">
                            <a href="/mi-cuenta" class="dropdown-item" data-link>
                                <span class="item-icon">👤</span>
                                Mi perfil
                            </a>
                            <a href="/mis-pedidos" class="dropdown-item" data-link>
                                <span class="item-icon">📦</span>
                                Mis pedidos
                            </a>
                            <a href="/suscripcion" class="dropdown-item" data-link>
                                <span class="item-icon">🌿</span>
                                Suscripción
                            </a>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item logout-item" id="logout-btn">
                                <span class="item-icon">🚪</span>
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Auth buttons (cuando NO está autenticado) -->
                <div class="auth-buttons" id="auth-buttons">
                    <a href="/login" class="btn-login" data-link>Ingresar</a>
                    <a href="/registro" class="btn-register" data-link>
                        <span>Comenzar</span>
                    </a>
                </div>

                <!-- Botón menú móvil -->
                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menú móvil">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>

        <!-- Mobile drawer -->
        <div class="mobile-drawer" id="mobile-drawer" role="dialog" aria-label="Menú de navegación">
            <nav class="mobile-nav-links">
                <a href="/" class="mobile-nav-link" data-link>🏠 Inicio</a>
                <a href="/tienda" class="mobile-nav-link" data-link>🛍️ Productos</a>
                <a href="/beneficios" class="mobile-nav-link" data-link>🌿 Beneficios</a>
                <a href="/blog" class="mobile-nav-link" data-link>📖 Blog</a>
            </nav>
            <div class="mobile-actions" id="mobile-auth-actions">
                <a href="/login" class="btn-login" data-link>Ingresar</a>
                <a href="/registro" class="btn-register" data-link><span>Comenzar</span></a>
            </div>
        </div>
    `;
}

/**
 * Inicializa el scroll behavior: barra de progreso + shadow
 */
function initScrollBehavior(navbar) {
    const progress = document.getElementById('nav-progress');

    const onScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progress) progress.style.width = `${pct}%`;

        if (scrollTop > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Inicializa el menú móvil
 */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        btn.classList.toggle('open', isOpen);
        btn.setAttribute('aria-expanded', isOpen);

        // Bloquear scroll del body cuando el drawer está abierto
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar al hacer click en un link del drawer
    drawer.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', () => {
            drawer.classList.remove('open');
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

/**
 * Inicializa el toggle de tema
 */
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!btn || !icon) return;

    const updateIcon = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        icon.textContent = isDark ? '☀️' : '🌙';
    };

    updateIcon();

    btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon();
    });
}

/**
 * Activa el link correspondiente a la ruta actual
 */
function setActiveLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === path || (href !== '/' && path.startsWith(href));
        link.classList.toggle('active', isActive);
    });
}

/**
 * Efecto ripple en nav links
 */
function initNavRipple() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const rect = link.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            link.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/**
 * Actualiza la navbar según el estado de autenticación
 */
export function updateNavbarAuth() {
    const isAuth = store.get('auth.isAuthenticated');
    const user = store.get('auth.user');

    const userMenuEl = document.getElementById('user-menu');
    const authBtnsEl = document.getElementById('auth-buttons');
    const mobileAuthEl = document.getElementById('mobile-auth-actions');

    if (isAuth && user) {
        // Mostrar user menu
        if (userMenuEl) userMenuEl.style.display = 'block';
        if (authBtnsEl) authBtnsEl.style.display = 'none';

        // Actualizar datos de usuario
        const name = user.name || user.email?.split('@')[0] || 'Usuario';
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        const el = (id) => document.getElementById(id);
        if (el('avatar-initials')) el('avatar-initials').textContent = initials;
        if (el('avatar-label')) el('avatar-label').textContent = name.split(' ')[0];
        if (el('dropdown-name')) el('dropdown-name').textContent = name;
        if (el('dropdown-email')) el('dropdown-email').textContent = user.email || '';

        // Mobile: reemplazar auth buttons con saludo
        if (mobileAuthEl) {
            mobileAuthEl.innerHTML = `
                <a href="/mi-cuenta" class="btn-login" data-link>Mi cuenta</a>
                <button class="btn-register mobile-logout-btn"><span>Cerrar sesión</span></button>
            `;
            mobileAuthEl.querySelector('.mobile-logout-btn')?.addEventListener('click', handleLogout);
        }
    } else {
        // Mostrar auth buttons
        if (userMenuEl) userMenuEl.style.display = 'none';
        if (authBtnsEl) authBtnsEl.style.display = 'flex';

        if (mobileAuthEl) {
            mobileAuthEl.innerHTML = `
                <a href="/login" class="btn-login" data-link>Ingresar</a>
                <a href="/registro" class="btn-register" data-link><span>Comenzar</span></a>
            `;
        }
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    store.logout();
    authGuard.logout();
    window.location.href = '/';
}

/**
 * Anima las ingredient pills con stagger
 */
function animatePills() {
    const pills = document.querySelectorAll('.pill-btn');
    pills.forEach((pill, i) => {
        pill.style.animationDelay = `${i * 0.15}s`;
        pill.style.animation = `fade-up 0.5s ${i * 0.15}s ease both`;
    });
}

/**
 * Renderiza y monta la navbar en el DOM
 */
export function renderNavbar() {
    // Evitar duplicados
    if (document.querySelector('.navbar-ginger')) return;

    const navbar = document.createElement('nav');
    navbar.className = 'navbar-ginger';
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', 'Navegación principal');
    navbar.innerHTML = getNavbarHTML();

    document.body.insertBefore(navbar, document.body.firstChild);

    // Inicializar comportamientos
    initScrollBehavior(navbar);
    initMobileMenu();
    initThemeToggle();
    initNavRipple();
    setActiveLink();
    animatePills();

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Actualizar carrito
    updateCartBadge();

    // Actualizar auth state
    setTimeout(updateNavbarAuth, 100);

    // Escuchar cambios de ruta para actualizar active link
    window.addEventListener('popstate', setActiveLink);
    window.addEventListener('pushstate', setActiveLink);
}

/**
 * Bump animation en badge del carrito
 */
export function bumpCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.classList.remove('bump');
    void badge.offsetWidth; // reflow
    badge.classList.add('bump');
}