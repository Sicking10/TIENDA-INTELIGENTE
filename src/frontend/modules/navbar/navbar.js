/**
 * GINGERcaps Navbar — Botanical Apothecary
 * navbar.js v2.1
 * Complete, self-contained, innovative navigation module
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { updateCartBadge } from '../../utils/cartUtils.js';

/* ─────────────────────────────────────────────
   LOGO SVG — Botanical ginger root emblem
───────────────────────────────────────────── */
function getLogoSVG() {
    return `
    <img src="/assets/images/icons/ginger.png" 
         alt="GINGERcaps Logo" 
         class="logo-image"
         width="46" 
         height="46">
    `;
}

/* ─────────────────────────────────────────────
   NAVBAR HTML TEMPLATE
───────────────────────────────────────────── */
function getNavbarHTML() {
    return `
        <div class="nav-progress" id="nav-progress" aria-hidden="true"></div>

        <div class="navbar-container">

            <a href="/" class="navbar-logo" data-link aria-label="GINGERcaps — Inicio">
                <div class="logo-emblem">
                    <div class="logo-orbit" aria-hidden="true"></div>
                    ${getLogoSVG()}
                </div>
                <div class="logo-wordmark">
                    <span class="logo-brand"><em>GINGER</em>caps</span>
                    <span class="logo-tagline">Bienestar Natural</span>
                </div>
            </a>

            <nav class="navbar-center" aria-label="Navegación principal">
                <div class="navbar-links" id="navbar-links" role="list">
                    <span class="nav-indicator" id="nav-indicator" aria-hidden="true"></span>

                    <a href="/" class="nav-link" data-link role="listitem">
                        <span class="nav-link-icon" aria-hidden="true">🏡</span>
                        Inicio
                    </a>
                    <a href="/tienda" class="nav-link" data-link role="listitem">
                        <span class="nav-link-icon" aria-hidden="true">🛍️</span>
                        Productos
                    </a>
                    <a href="/beneficios" class="nav-link" data-link role="listitem">
                        <span class="nav-link-icon" aria-hidden="true">🌿</span>
                        Beneficios
                    </a>
                    <a href="/blog" class="nav-link" data-link role="listitem">
                        <span class="nav-link-icon" aria-hidden="true">📖</span>
                        Blog
                    </a>
                </div>
            </nav>

            <div class="navbar-actions">

                <div class="ingredient-drops" aria-hidden="true">
                    <div class="drop-pill drop-pill-ginger" title="Jengibre">
                        <span class="drop-icon">🫚</span>
                        <span class="drop-label">Jengibre</span>
                    </div>
                    <div class="drop-pill drop-pill-turmeric" title="Cúrcuma">
                        <span class="drop-icon">🌱</span>
                        <span class="drop-label">Cúrcuma</span>
                    </div>
                    <div class="drop-pill drop-pill-chamomile" title="Manzanilla">
                        <span class="drop-icon">🌼</span>
                        <span class="drop-label">Manzanilla</span>
                    </div>
                </div>

                <button class="theme-toggle" id="theme-toggle" aria-label="Cambiar tema">
                    <span id="theme-icon" aria-hidden="true">🌙</span>
                </button>

                <a href="/carrito" class="cart-btn" data-link aria-label="Ver carrito">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                         aria-hidden="true">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    <span class="cart-badge" id="cart-badge">0</span>
                </a>

                <div class="user-menu" id="user-menu" style="display:none;">
                    <button class="user-avatar-btn" id="user-avatar-btn"
                            aria-haspopup="true" aria-expanded="false">
                        <div class="avatar-ring">
                            <div class="avatar-circle" id="avatar-initials"
                                 aria-hidden="true">U</div>
                        </div>
                        <span class="avatar-label" id="avatar-label">Mi cuenta</span>
                        <svg class="avatar-chevron" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>

                    <div class="user-dropdown" id="user-dropdown" role="menu">
                        <div class="dropdown-header">
                            <div class="dropdown-user-name" id="dropdown-name">Usuario</div>
                            <div class="dropdown-user-email" id="dropdown-email">usuario@email.com</div>
                        </div>
                        <div class="dropdown-nav">
                            <a href="/mi-cuenta" class="dropdown-item" data-link role="menuitem">
                                <span class="item-icon-wrap" aria-hidden="true">👤</span>
                                Mi perfil
                            </a>
                            <a href="/mis-pedidos" class="dropdown-item" data-link role="menuitem">
                                <span class="item-icon-wrap" aria-hidden="true">📦</span>
                                Mis pedidos
                            </a>
                            <a href="/suscripcion" class="dropdown-item" data-link role="menuitem">
                                <span class="item-icon-wrap" aria-hidden="true">🌿</span>
                                Suscripción
                            </a>
                            <div class="dropdown-divider" role="separator"></div>
                            <button class="dropdown-item logout-item" id="logout-btn" role="menuitem">
                                <span class="item-icon-wrap" aria-hidden="true">🚪</span>
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>

                <div class="auth-buttons" id="auth-buttons">
                    <a href="/login" class="btn-login" data-link>Ingresar</a>
                    <a href="/registro" class="btn-register" data-link>
                        <span class="btn-register-leaf" aria-hidden="true">🌿</span>
                        Comenzar
                    </a>
                </div>

                <button class="mobile-menu-btn" id="mobile-menu-btn"
                        aria-label="Abrir menú" aria-expanded="false">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>

        <div class="mobile-drawer" id="mobile-drawer"
             role="dialog" aria-label="Menú principal" aria-modal="false">
            <nav class="mobile-nav-links">
                <a href="/" class="mobile-nav-link" data-link>
                    <span class="mobile-nav-icon" aria-hidden="true">🏡</span>
                    Inicio
                </a>
                <a href="/tienda" class="mobile-nav-link" data-link>
                    <span class="mobile-nav-icon" aria-hidden="true">🛍️</span>
                    Productos
                </a>
                <a href="/beneficios" class="mobile-nav-link" data-link>
                    <span class="mobile-nav-icon" aria-hidden="true">🌿</span>
                    Beneficios
                </a>
                <a href="/blog" class="mobile-nav-link" data-link>
                    <span class="mobile-nav-icon" aria-hidden="true">📖</span>
                    Blog
                </a>
            </nav>
            <div class="mobile-divider"></div>
            <div class="mobile-auth" id="mobile-auth-section">
                <a href="/login" class="btn-login" data-link>Ingresar</a>
                <a href="/registro" class="btn-register" data-link>
                    <span class="btn-register-leaf" aria-hidden="true">🌿</span>
                    Comenzar
                </a>
            </div>
        </div>
    `;
}

/* ─────────────────────────────────────────────
   SCROLL BEHAVIOR
───────────────────────────────────────────── */
function initScrollBehavior(navbar) {
    const progress = document.getElementById('nav-progress');
    let ticking = false;

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

                if (progress) progress.style.width = `${Math.min(pct, 100)}%`;
                navbar.classList.toggle('scrolled', scrollTop > 20);

                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─────────────────────────────────────────────
   SLIDING ACTIVE INDICATOR
───────────────────────────────────────────── */
function initNavIndicator() {
    const indicator = document.getElementById('nav-indicator');
    const container = document.getElementById('navbar-links');
    if (!indicator || !container) return;

    const moveIndicator = (link) => {
        if (!link) {
            indicator.style.opacity = '0';
            return;
        }
        const containerRect = container.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();

        indicator.style.left = `${linkRect.left - containerRect.left}px`;
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.opacity = '1';
    };

    const activeLink = container.querySelector('.nav-link.active');
    moveIndicator(activeLink);

    container.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', () => moveIndicator(link));
    });

    container.addEventListener('mouseleave', () => {
        const current = container.querySelector('.nav-link.active');
        moveIndicator(current);
    });
}

/* ─────────────────────────────────────────────
   ACTIVE LINK DETECTION
───────────────────────────────────────────── */
function setActiveLink() {
    const path = window.location.pathname;
    
    console.log('[NAVBAR] setActiveLink - path:', path);

    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        
        // Comparación exacta para home y startsWith para subrutas
        let isActive;
        if (href === '/') {
            isActive = path === '/';
        } else {
            isActive = path.startsWith(href);
        }
        
        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Actualizar el indicador deslizante después de cambiar el active
    setTimeout(() => initNavIndicator(), 30);
}


/* ─────────────────────────────────────────────
   RIPPLE EFFECT
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────────── */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (!btn || !drawer) return;

    const closeDrawer = () => {
        drawer.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    const openDrawer = () => {
        drawer.classList.add('open');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    btn.addEventListener('click', () => {
        drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    drawer.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('open') &&
            !drawer.contains(e.target) &&
            !btn.contains(e.target)) {
            closeDrawer();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
            btn.focus();
        }
    });
}

/* ─────────────────────────────────────────────
   USER DROPDOWN
───────────────────────────────────────────── */
function initUserDropdown() {
    const menuEl = document.getElementById('user-menu');
    const btnEl = document.getElementById('user-avatar-btn');
    const dropEl = document.getElementById('user-dropdown');
    if (!menuEl || !btnEl || !dropEl) return;

    const close = () => {
        menuEl.classList.remove('open');
        btnEl.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
        menuEl.classList.add('open');
        btnEl.setAttribute('aria-expanded', 'true');
    };

    btnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        menuEl.classList.contains('open') ? close() : open();
    });

    document.addEventListener('click', (e) => {
        if (!menuEl.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    dropEl.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', close);
    });
}

/* ─────────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────────── */
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!btn || !icon) return;

    const update = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        icon.textContent = isDark ? '☀️' : '🌙';
    };

    update();

    btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        update();
    });
}

/* ─────────────────────────────────────────────
   AUTH STATE → NAVBAR
───────────────────────────────────────────── */
export function updateNavbarAuth() {
    const isAuth = store.get('auth.isAuthenticated');
    const user = store.get('auth.user');

    const userMenuEl = document.getElementById('user-menu');
    const authBtnsEl = document.getElementById('auth-buttons');
    const mobileAuthEl = document.getElementById('mobile-auth-section');

    if (isAuth && user) {
        if (userMenuEl) userMenuEl.style.display = 'block';
        if (authBtnsEl) authBtnsEl.style.display = 'none';

        const name = user.name || user.email?.split('@')[0] || 'Usuario';
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        const avatarInitials = document.getElementById('avatar-initials');
        const avatarLabel = document.getElementById('avatar-label');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');

        if (avatarLabel) avatarLabel.textContent = name.split(' ')[0];
        if (dropdownName) dropdownName.textContent = name;
        if (dropdownEmail) dropdownEmail.textContent = user.email || '';

        // 🔥 CARGAR AVATAR GUARDADO DESDE LOCALSTORAGE
        const savedAvatar = localStorage.getItem('user_avatar');
        const avatarCircle = document.querySelector('.avatar-circle');
        
        if (savedAvatar && avatarCircle) {
            // Si hay avatar guardado, mostrarlo como imagen
            avatarCircle.innerHTML = '';
            const img = document.createElement('img');
            img.src = savedAvatar;
            img.alt = 'Avatar';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            avatarCircle.appendChild(img);
        } else if (avatarInitials) {
            // Si no hay avatar guardado, mostrar iniciales
            avatarInitials.textContent = initials;
        }

        if (mobileAuthEl) {
            mobileAuthEl.innerHTML = `
                <a href="/mi-cuenta" class="btn-login" data-link>👤 Mi cuenta</a>
                <button class="btn-register mobile-logout" type="button">
                    <span>Cerrar sesión</span>
                </button>
            `;
            mobileAuthEl.querySelector('.mobile-logout')?.addEventListener('click', handleLogout);
        }
    } else {
        if (userMenuEl) userMenuEl.style.display = 'none';
        if (authBtnsEl) authBtnsEl.style.display = 'flex';

        if (mobileAuthEl) {
            mobileAuthEl.innerHTML = `
                <a href="/login" class="btn-login" data-link>Ingresar</a>
                <a href="/registro" class="btn-register" data-link>
                    <span class="btn-register-leaf" aria-hidden="true">🌿</span>
                    Comenzar
                </a>
            `;
        }
    }
}

/* ─────────────────────────────────────────────
   LOGOUT HANDLER
───────────────────────────────────────────── */
function handleLogout() {
    store.logout();
    authGuard.logout();
    window.location.href = '/';
}

/* ─────────────────────────────────────────────
   CART BADGE
───────────────────────────────────────────── */
export function bumpCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
}

/* ─────────────────────────────────────────────
   RENDER & MOUNT NAVBAR
───────────────────────────────────────────── */
export function renderNavbar() {
    if (document.querySelector('.navbar-ginger')) return;

    const navbar = document.createElement('nav');
    navbar.className = 'navbar-ginger';
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', 'Navegación principal GINGERcaps');
    navbar.innerHTML = getNavbarHTML();

    document.body.insertBefore(navbar, document.body.firstChild);

    initScrollBehavior(navbar);
    initMobileMenu();
    initThemeToggle();
    initNavRipple();
    initNavIndicator();
    setActiveLink();
    initUserDropdown();

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    updateCartBadge();

    setTimeout(updateNavbarAuth, 120);

    // Escuchar cambios de ruta del router
    window.addEventListener('popstate', () => {
        console.log('[NAVBAR] popstate detected, updating active link');
        setActiveLink();
    });

    // 🔥 ESCUCHAR EVENTO PERSONALIZADO DEL ROUTER
    window.addEventListener('router-navigate', (event) => {
        console.log('[NAVBAR] router-navigate detected, path:', event.detail?.path);
        setActiveLink();
    });
}