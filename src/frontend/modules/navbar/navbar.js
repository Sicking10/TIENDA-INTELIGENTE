/**
 * GINGERcaps Navbar — Botanical Apothecary
 * navbar.js v3.0 - Responsive completo
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { updateCartBadge } from '../../utils/cartUtils.js';

function getLogoSVG() {
    return `<img src="/assets/images/icons/ginger.png" alt="GINGERcaps Logo" class="logo-image" width="46" height="46">`;
}

function getNavbarHTML() {
    return `
        <div class="nav-progress" id="nav-progress"></div>
        <div class="navbar-container">
            <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Abrir menú">
                <span></span><span></span><span></span>
            </button>

            <a href="/" class="navbar-logo desktop-logo" data-link>
                <div class="logo-emblem">
                    <div class="logo-orbit"></div>
                    ${getLogoSVG()}
                </div>
                <div class="logo-wordmark">
                    <span class="logo-brand"><em>GINGER</em>caps</span>
                    <span class="logo-tagline">Bienestar Natural</span>
                </div>
            </a>

            <nav class="navbar-center">
                <div class="navbar-links" id="navbar-links">
                    <span class="nav-indicator" id="nav-indicator"></span>
                    <a href="/" class="nav-link" data-link><span class="nav-link-icon">🏡</span>Inicio</a>
                    <a href="/tienda" class="nav-link" data-link><span class="nav-link-icon">🛍️</span>Productos</a>
                    <a href="/beneficios" class="nav-link" data-link><span class="nav-link-icon">🌿</span>Beneficios</a>
                    <a href="/blog" class="nav-link" data-link><span class="nav-link-icon">📖</span>Blog</a>
                </div>
            </nav>

            <div class="navbar-actions">
                <div class="ingredient-drops">
                    <div class="drop-pill drop-pill-ginger"><span class="drop-icon">🫚</span><span class="drop-label">Jengibre</span></div>
                    <div class="drop-pill drop-pill-turmeric"><span class="drop-icon">🌱</span><span class="drop-label">Cúrcuma</span></div>
                    <div class="drop-pill drop-pill-chamomile"><span class="drop-icon">🌼</span><span class="drop-label">Manzanilla</span></div>
                </div>
                <button class="theme-toggle" id="theme-toggle"><span id="theme-icon">🌙</span></button>
                <a href="/carrito" class="cart-btn" data-link>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    <span class="cart-badge" id="cart-badge">0</span>
                </a>
                <div class="user-menu" id="user-menu" style="display:none;">
                    <button class="user-avatar-btn" id="user-avatar-btn">
                        <div class="avatar-ring"><div class="avatar-circle" id="avatar-initials">U</div></div>
                        <span class="avatar-label" id="avatar-label">Mi cuenta</span>
                        <svg class="avatar-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="user-dropdown" id="user-dropdown">
                        <div class="dropdown-header">
                            <div class="dropdown-user-name" id="dropdown-name">Usuario</div>
                            <div class="dropdown-user-email" id="dropdown-email">usuario@email.com</div>
                        </div>
                        <div class="dropdown-nav">
                            <a href="/mi-cuenta" class="dropdown-item" data-link><span class="item-icon-wrap">👤</span>Mi perfil</a>
                            <a href="/mis-pedidos" class="dropdown-item" data-link><span class="item-icon-wrap">📦</span>Mis pedidos</a>
                            <a href="/suscripcion" class="dropdown-item" data-link><span class="item-icon-wrap">🌿</span>Suscripción</a>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item logout-item" id="logout-btn"><span class="item-icon-wrap">🚪</span>Cerrar sesión</button>
                        </div>
                    </div>
                </div>
                <div class="auth-buttons" id="auth-buttons">
                    <a href="/login" class="btn-login" data-link>Ingresar</a>
                    <a href="/registro" class="btn-register" data-link><span class="btn-register-leaf">🌿</span>Comenzar</a>
                </div>
            </div>
        </div>

        <div class="mobile-drawer" id="mobile-drawer">
            <div class="mobile-logo">
                <div class="mobile-logo-emblem">${getLogoSVG()}</div>
                <div class="mobile-logo-text">
                    <span class="mobile-logo-brand"><em>GINGER</em>caps</span>
                    <span class="mobile-logo-tagline">Bienestar Natural</span>
                </div>
            </div>

            <div class="mobile-user-section" id="mobile-user-section" style="display:none;">
                <div class="mobile-user-avatar" id="mobile-user-avatar"><span id="mobile-avatar-initials">U</span></div>
                <div class="mobile-user-info">
                    <div class="mobile-user-name" id="mobile-user-name">Usuario</div>
                    <div class="mobile-user-email" id="mobile-user-email">usuario@email.com</div>
                </div>
            </div>

            <nav class="mobile-nav-links">
                <a href="/" class="mobile-nav-link" data-link><span class="mobile-nav-icon">🏡</span>Inicio</a>
                <a href="/tienda" class="mobile-nav-link" data-link><span class="mobile-nav-icon">🛍️</span>Productos</a>
                <a href="/beneficios" class="mobile-nav-link" data-link><span class="mobile-nav-icon">🌿</span>Beneficios</a>
                <a href="/blog" class="mobile-nav-link" data-link><span class="mobile-nav-icon">📖</span>Blog</a>
            </nav>

            <div class="mobile-ingredients">
                <div class="mobile-ingredients-title">Nuestros ingredientes</div>
                <div class="mobile-ingredients-list">
                    <div class="mobile-ingredient"><span>🫚</span><span>Jengibre</span></div>
                    <div class="mobile-ingredient"><span>🌿</span><span>Cúrcuma</span></div>
                    <div class="mobile-ingredient"><span>🌼</span><span>Manzanilla</span></div>
                </div>
            </div>

            <div class="mobile-theme-toggle" id="mobile-theme-toggle">
                <span>Tema oscuro</span>
                <span class="theme-icon" id="mobile-theme-icon">🌙</span>
            </div>
        </div>
    `;
}

function initScrollBehavior(navbar) {
    const progress = document.getElementById('nav-progress');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                if (progress) progress.style.width = `${Math.min(pct, 100)}%`;
                navbar.classList.toggle('scrolled', scrollTop > 20);
                ticking = false;
            });
            ticking = true;
        }
    });
}

function initNavIndicator() {
    const indicator = document.getElementById('nav-indicator');
    const container = document.getElementById('navbar-links');
    if (!indicator || !container) return;
    const moveIndicator = (link) => {
        if (!link) { indicator.style.opacity = '0'; return; }
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

function setActiveLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === '/' ? path === '/' : path.startsWith(href);
        link.classList.toggle('active', isActive);
    });
    setTimeout(() => initNavIndicator(), 30);
}

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
    drawer.querySelectorAll('[data-link], .mobile-logout-btn, .mobile-theme-toggle').forEach(el => {
        if (!el.classList.contains('mobile-theme-toggle')) {
            el.addEventListener('click', closeDrawer);
        }
    });
    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('open') && !drawer.contains(e.target) && !btn.contains(e.target)) closeDrawer();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
}

function initUserDropdown() {
    const menuEl = document.getElementById('user-menu');
    const btnEl = document.getElementById('user-avatar-btn');
    if (!menuEl || !btnEl) return;
    const close = () => { menuEl.classList.remove('open'); btnEl.setAttribute('aria-expanded', 'false'); };
    const open = () => { menuEl.classList.add('open'); btnEl.setAttribute('aria-expanded', 'true'); };
    btnEl.addEventListener('click', (e) => { e.stopPropagation(); menuEl.classList.contains('open') ? close() : open(); });
    document.addEventListener('click', (e) => { if (!menuEl.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    const mobileIcon = document.getElementById('mobile-theme-icon');
    if (!btn || !icon) return;
    const updateIcon = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        icon.textContent = isDark ? '☀️' : '🌙';
        if (mobileIcon) mobileIcon.textContent = isDark ? '☀️' : '🌙';
        if (mobileToggle) {
            const span = mobileToggle.querySelector('span:first-child');
            if (span) span.textContent = isDark ? 'Tema claro' : 'Tema oscuro';
        }
    };
    updateIcon();
    btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon();
    });
    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon();
        });
    }
}

function updateMobileCartBadge() {
    const mobileBadge = document.getElementById('mobile-cart-badge');
    if (mobileBadge) {
        const count = store.get('cart.itemCount') || 0;
        mobileBadge.textContent = count;
    }
}

export function updateNavbarAuth() {
    const isAuth = store.get('auth.isAuthenticated');
    const user = store.get('auth.user');
    const userMenuEl = document.getElementById('user-menu');
    const authBtnsEl = document.getElementById('auth-buttons');
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    const mobileActionsSection = document.getElementById('mobile-actions-section');
    const mobileUserSection = document.getElementById('mobile-user-section');
    const mobileUserName = document.getElementById('mobile-user-name');
    const mobileUserEmail = document.getElementById('mobile-user-email');
    const mobileAvatarInitials = document.getElementById('mobile-avatar-initials');
    const mobileAvatarContainer = document.querySelector('.mobile-user-avatar');
    if (isAuth && user) {
        if (userMenuEl) userMenuEl.style.display = 'block';
        if (authBtnsEl) authBtnsEl.style.display = 'none';
        const name = user.name || user.email?.split('@')[0] || 'Usuario';
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const avatarLabel = document.getElementById('avatar-label');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');
        if (avatarLabel) avatarLabel.textContent = name.split(' ')[0];
        if (dropdownName) dropdownName.textContent = name;
        if (dropdownEmail) dropdownEmail.textContent = user.email || '';
        const savedAvatar = localStorage.getItem('user_avatar');
        const avatarCircle = document.querySelector('.avatar-circle');
        if (savedAvatar && avatarCircle) {
            avatarCircle.innerHTML = '';
            const img = document.createElement('img');
            img.src = savedAvatar;
            img.style.width = '100%'; img.style.height = '100%'; img.style.borderRadius = '50%'; img.style.objectFit = 'cover';
            avatarCircle.appendChild(img);
        } else {
            const avatarInitials = document.getElementById('avatar-initials');
            if (avatarInitials) avatarInitials.textContent = initials;
        }
        if (mobileAuthSection) mobileAuthSection.style.display = 'none';
        if (mobileActionsSection) mobileActionsSection.style.display = 'flex';
        if (mobileUserSection) mobileUserSection.style.display = 'flex';
        if (mobileUserName) mobileUserName.textContent = name;
        if (mobileUserEmail) mobileUserEmail.textContent = user.email || '';
        if (mobileAvatarInitials) mobileAvatarInitials.textContent = initials;
        if (savedAvatar && mobileAvatarContainer) {
            mobileAvatarContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = savedAvatar;
            mobileAvatarContainer.appendChild(img);
        }
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (mobileLogoutBtn) mobileLogoutBtn.onclick = () => handleLogout();
    } else {
        if (userMenuEl) userMenuEl.style.display = 'none';
        if (authBtnsEl) authBtnsEl.style.display = 'flex';
        if (mobileAuthSection) mobileAuthSection.style.display = 'flex';
        if (mobileActionsSection) mobileActionsSection.style.display = 'none';
        if (mobileUserSection) mobileUserSection.style.display = 'none';
    }
}

function handleLogout() {
    store.logout();
    authGuard.logout();
    window.location.href = '/';
}

export function bumpCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
}

export function renderNavbar() {
    if (document.querySelector('.navbar-ginger')) return;
    const navbar = document.createElement('nav');
    navbar.className = 'navbar-ginger';
    navbar.setAttribute('role', 'navigation');
    navbar.innerHTML = getNavbarHTML();
    document.body.insertBefore(navbar, document.body.firstChild);
    initScrollBehavior(navbar);
    initMobileMenu();
    initThemeToggle();
    initNavIndicator();
    setActiveLink();
    initUserDropdown();
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    updateCartBadge();
    updateMobileCartBadge();
    setTimeout(updateNavbarAuth, 120);
    window.addEventListener('popstate', setActiveLink);
    window.addEventListener('router-navigate', setActiveLink);
    store.subscribe((path) => {
        if (path === 'cart.itemCount') {
            updateCartBadge();
            updateMobileCartBadge();
        }
        if (path === 'auth.isAuthenticated' || path === 'auth.user') updateNavbarAuth();
    });
}