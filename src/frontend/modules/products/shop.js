/* ============================================
   SHOP.JS - Botanical Apothecary Style
   Con Cloudinary
============================================ */

import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, updateCartBadge } from '../../utils/cartUtils.js';
import { bumpCartBadge } from '../navbar/navbar.js';

// ─── Variables ───────────────────────────────────────────────────────────────
let products = [];
let activeModal = null;

// ─── Cargar productos desde API ──────────────────────────────────────────────
async function loadProductsFromAPI() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success) {
            products = data.products;
            return products;
        }
        return [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// ─── Layout class según cantidad de productos ────────────────────────────────
function getGridClass(count) {
    if (count === 1) return 'grid-solo';
    if (count === 2) return 'grid-duo';
    if (count <= 4) return 'grid-quartet';
    if (count <= 6) return 'grid-six';
    return 'grid-many';
}

// ─── Manejo de errores de imagen ─────────────────────────────────────────────
function setupImageErrorHandlers() {
    document.querySelectorAll('.pcard-img').forEach(img => {
        img.removeEventListener('error', img._errorHandler);
        const handler = () => {
            const isGold = img.closest('.product-card')?.dataset.productType === 'gold';
            img.parentElement.innerHTML = `
                <div class="img-fallback">
                    <span>${isGold ? '🫚' : '✨'}</span>
                </div>`;
        };
        img._errorHandler = handler;
        img.addEventListener('error', handler);
    });
}

// ─── Estado del stock ────────────────────────────────────────────────────────
function getStockStatus(stock) {
    if (stock === undefined || stock === null) {
        return { class: 'stock-unknown', text: 'Consultar disponibilidad' };
    }
    if (stock <= 0) {
        return { class: 'stock-out', text: 'Agotado' };
    }
    if (stock <= 5) {
        return { class: 'stock-low', text: `Últimas ${stock} unidades` };
    }
    if (stock <= 15) {
        return { class: 'stock-limited', text: `¡Solo ${stock} disponibles!` };
    }
    return { class: 'stock-available', text: 'Disponible' };
}

// ─── Render de tarjetas ──────────────────────────────────────────────────────
function renderProductCard(p, index) {
    const saving = p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
        : 0;
    const badgeClass = p.tagType === 'gold' ? 'badge-gold' : 'badge-crimson';
    const delay = index * 80;

    const stockStatus = getStockStatus(p.stock);
    const stockHtml = `
        <div class="pcard-stock ${stockStatus.class}">
            <span class="stock-indicator"></span>
            <span>${stockStatus.text}</span>
        </div>
    `;

    // 🔥 IMAGEN CON CLOUDINARY
    const imageSrc = p.imageUrl || `/assets/images/products/${p.image || 'placeholder.jpg'}`;

    return `
        <article
            class="product-card animate-on-scroll"
            data-product-id="${p._id}"
            data-product-type="${p.tagType || ''}"
            style="--card-delay: ${delay}ms"
        >
            <div class="pcard-image-wrap">
                ${p.tag ? `<div class="pcard-badge ${badgeClass}">${p.tagType === 'gold' ? '⭐' : '✦'} ${p.tag}</div>` : ''}
                <img
                    src="${imageSrc}"
                    alt="${p.imageAlt || p.name}"
                    class="pcard-img"
                    loading="lazy"
                    draggable="false"
                    onerror="this.src='/assets/images/products/placeholder.jpg'"
                >
                <div class="pcard-image-overlay">
                    <button
                        class="btn-quick-view"
                        data-product-id="${p._id}"
                        aria-label="Ver detalles de ${p.name}"
                    >
                        <span class="quick-view-icon">🔍</span>
                        <span>Ver detalles</span>
                    </button>
                </div>
                ${saving > 0 ? `<div class="pcard-discount">−${saving}%</div>` : ''}
                ${stockHtml}
            </div>

            <div class="pcard-body">
                <div class="pcard-meta">
                    <span class="pcard-concentration">${p.concentration || ''}</span>
                </div>
                <h3 class="pcard-name">${p.name}</h3>
                <p class="pcard-desc">${p.desc}</p>

                ${p.benefits && p.benefits.length > 0 ? `
                <ul class="pcard-benefits">
                    ${p.benefits.slice(0, 3).map(b => `<li>${b}</li>`).join('')}
                </ul>` : ''}

                <div class="pcard-footer">
                    <div class="pcard-price-group">
                        <span class="pcard-price">$${p.price}</span>
                        ${p.oldPrice && p.oldPrice > p.price
            ? `<span class="pcard-old-price">$${p.oldPrice}</span>`
            : ''}
                    </div>
                    <button
                        class="btn-add-cart"
                        data-product='${JSON.stringify({
                id: p._id,
                name: p.name,
                price: p.price,
                image: p.image || 'placeholder.jpg',
                imageUrl: p.imageUrl || ''
            })}'
                        ${p.stock === 0 ? 'disabled' : ''}
                        aria-label="Agregar ${p.name} al carrito"
                    >
                        <span class="cart-icon">🛍️</span>
                        <span class="cart-label">${p.stock === 0 ? 'Agotado' : 'Agregar'}</span>
                    </button>
                </div>
            </div>
        </article>
    `;
}

// ─── Render grid de productos ────────────────────────────────────────────────
function renderProducts() {
    if (!products || products.length === 0) {
        return `
            <div class="shop-empty">
                <div class="empty-icon">🌿</div>
                <h3>Próximamente</h3>
                <p>Estamos preparando nuevos productos para ti.</p>
            </div>
        `;
    }

    const gridClass = getGridClass(products.length);
    return `
        <div class="products-grid ${gridClass}">
            ${products.map((p, i) => renderProductCard(p, i)).join('')}
        </div>
    `;
}

// ─── Template principal ──────────────────────────────────────────────────────
function getShopHTML() {
    return `
    <div class="shop-page">

        <!-- Hero -->
        <section class="shop-hero">
            <div class="hero-bg-layer" aria-hidden="true"></div>
            <div class="hero-blob hero-blob-1" aria-hidden="true"></div>
            <div class="hero-blob hero-blob-2" aria-hidden="true"></div>
            <div class="hero-grain" aria-hidden="true"></div>

            <div class="container-shop">
                <div class="hero-content">
                    <div class="hero-eyebrow">
                        <span class="eyebrow-icon">🌿</span>
                        <span class="eyebrow-text">Colección Botánica</span>
                    </div>
                    <h1 class="hero-title">
                        El poder del<br>
                        <em>jengibre</em> en cada cápsula
                    </h1>
                    <p class="hero-description">
                        Descubre nuestra colección de cápsulas de jengibre de alta concentración.
                    </p>
                </div>
            </div>
        </section>

        <!-- Productos -->
        <section class="products-showcase">
            <div class="container-shop">
                <div class="section-header animate-on-scroll">
                    <span class="section-eyebrow">✦ Nuestras fórmulas ✦</span>
                    <h2 class="section-title">Bienestar en <em>cada cápsula</em></h2>
                    <p class="section-subtitle">Productos diseñados para tu bienestar diario</p>
                </div>

                <div id="products-grid">
                    <div class="loading-products">
                        <div class="loading-spinner"></div>
                        <p>Cargando productos...</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pilares -->
        <section class="pillars-section">
            <div class="container-shop">
                <div class="pillars-grid">
                    <div class="pillar-item animate-on-scroll animate-delay-1">
                        <div class="pillar-icon">🌿</div>
                        <h3 class="pillar-title">Origen Sagrado</h3>
                        <p class="pillar-text">Cultivado en montañas donde la tierra es más pura.</p>
                    </div>
                    <div class="pillar-item animate-on-scroll animate-delay-2">
                        <div class="pillar-icon">⚗️</div>
                        <h3 class="pillar-title">Alquimia Moderna</h3>
                        <p class="pillar-text">Extracción que preserva todos los compuestos bioactivos.</p>
                    </div>
                    <div class="pillar-item animate-on-scroll animate-delay-3">
                        <div class="pillar-icon">✨</div>
                        <h3 class="pillar-title">Transformación</h3>
                        <p class="pillar-text">Resultados desde la primera semana.</p>
                    </div>
                </div>
            </div>
        </section>

    </div>
    `;
}

// ─── Scroll Animations ────────────────────────────────────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────
function initAddToCart() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productData = JSON.parse(btn.dataset.product);

            btn.classList.add('btn-bounce');
            setTimeout(() => btn.classList.remove('btn-bounce'), 300);

            store.addToCart({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                imageUrl: productData.imageUrl,
                quantity: 1,
            });

            showNotification(`🫚 ${productData.name} agregado al carrito`, 'success');
            updateCartBadge();
            if (typeof bumpCartBadge === 'function') bumpCartBadge();
        });
    });
}

// ─── Modal de producto ────────────────────────────────────────────────────────
function openProductModal(productId) {
    if (activeModal) {
        activeModal.remove();
        activeModal = null;
    }

    const product = products.find(p => p._id === productId);
    if (!product) return;

    const saving = product.oldPrice && product.oldPrice > product.price
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;
    const badgeClass = product.tagType === 'gold' ? 'badge-gold' : 'badge-crimson';
    
    // 🔥 IMAGEN CON CLOUDINARY
    const imageSrc = product.imageUrl || `/assets/images/products/${product.image || 'placeholder.jpg'}`;

    const modal = document.createElement('div');
    modal.className = 'modal-shop';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container" role="dialog" aria-modal="true" aria-label="${product.name}">
            <button class="modal-close" aria-label="Cerrar">✕</button>

            <div class="modal-layout">
                <div class="modal-image-side">
                    <img
                        src="${imageSrc}"
                        alt="${product.imageAlt || product.name}"
                        class="modal-img"
                        loading="lazy"
                        onerror="this.src='/assets/images/products/placeholder.jpg'"
                    >
                    ${saving > 0 ? `<div class="modal-discount-badge">−${saving}% OFF</div>` : ''}
                </div>

                <div class="modal-info-side">
                    ${product.tag ? `<div class="pcard-badge ${badgeClass}" style="margin-bottom:18px;">${product.tagType === 'gold' ? '⭐' : '✦'} ${product.tag}</div>` : ''}
                    <h2 class="modal-title">${product.name}</h2>
                    ${product.concentration ? `<span class="pcard-concentration" style="margin-bottom:16px;">${product.concentration}</span>` : ''}
                    <div class="modal-rating">
                        <span class="stars">★★★★★</span>
                        <span class="rating-val">${product.rating || 4.5}</span>
                        <span class="rating-count">(${product.reviews || 0} reseñas)</span>
                    </div>
                    <p class="modal-description">${product.longDesc || product.desc}</p>
                    ${product.benefits && product.benefits.length > 0 ? `
                    <div class="modal-benefits">
                        ${product.benefits.map(b => `<span class="modal-benefit-tag">${b}</span>`).join('')}
                    </div>` : ''}
                    ${product.ritual ? `
                    <div class="modal-ritual">
                        <span class="ritual-label"><i class="fas fa-feather-alt"></i> Ritual de consumo</span>
                        <p class="ritual-desc">${product.ritual}</p>
                    </div>` : ''}
                    <div class="modal-stock">
                        <div class="stock-status ${getStockStatus(product.stock).class}">
                            <span class="stock-indicator"></span>
                            <span>${getStockStatus(product.stock).text}</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="modal-price-group">
                            <span class="modal-price-current">$${product.price}</span>
                            ${product.oldPrice && product.oldPrice > product.price ? `<span class="modal-price-old">$${product.oldPrice}</span>` : ''}
                        </div>
                        <button class="btn-add-cart btn-add-cart-modal" data-product='${JSON.stringify({
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.image || 'placeholder.jpg',
                            imageUrl: product.imageUrl || ''
                        })}'>
                            <span>🛍️</span>
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    activeModal = modal;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('active'));

    const modalImg = modal.querySelector('.modal-img');
    if (modalImg) {
        modalImg.addEventListener('error', function () {
            const isGold = product.tagType === 'gold';
            this.parentElement.innerHTML = `
                <div class="img-fallback modal-img-fallback">
                    <span>${isGold ? '🫚' : '✨'}</span>
                </div>`;
        });
    }

    const closeModal = () => {
        if (!activeModal) return;
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (activeModal) { activeModal.remove(); activeModal = null; }
        }, 320);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    const handleEscape = (e) => {
        if (e.key === 'Escape' && activeModal) {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    const addBtn = modal.querySelector('.btn-add-cart-modal');
    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productData = JSON.parse(addBtn.dataset.product);
            store.addToCart({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                imageUrl: productData.imageUrl,
                quantity: 1,
            });
            showNotification(`🫚 ${productData.name} agregado al carrito`, 'success');
            updateCartBadge();
            if (typeof bumpCartBadge === 'function') bumpCartBadge();
            closeModal();
        });
    }
}

// ─── Inicializar clicks en tarjetas ──────────────────────────────────────────
function initProductCards() {
    document.querySelectorAll('.btn-quick-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openProductModal(btn.dataset.productId);
        });
    });

    document.querySelectorAll('.pcard-image-wrap').forEach(wrap => {
        wrap.addEventListener('click', (e) => {
            if (e.target.closest('.btn-quick-view')) return;
            const card = wrap.closest('.product-card');
            if (card) openProductModal(card.dataset.productId);
        });
    });
}

// ─── View Class ───────────────────────────────────────────────────────────────
export default class ShopView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this._observers = [];
    }

    async render() {
        this.container.innerHTML = getShopHTML();
        await loadProductsFromAPI();
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = renderProducts();
        }
        await new Promise(r => requestAnimationFrame(r));
        initScrollAnimations();
        initAddToCart();
        initProductCards();
        setupImageErrorHandlers();
        updateCartBadge();
        return this;
    }

    destroy() {
        this._observers.forEach(o => o.disconnect());
        this._observers = [];
        if (activeModal) {
            activeModal.remove();
            activeModal = null;
            document.body.style.overflow = '';
        }
    }
}