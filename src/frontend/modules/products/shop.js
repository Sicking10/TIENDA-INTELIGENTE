/* ============================================
   SHOP.JS - Botanical Apothecary Style
   2 productos CON IMÁGENES REALES - CORREGIDO
============================================ */

import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, updateCartBadge } from '../../utils/cartUtils.js';
import { bumpCartBadge } from '../navbar/navbar.js';

// ─── DATA - 2 productos únicos CON IMÁGENES ─────────────────────────────────

const PRODUCTS = [
    {
        id: 'ginger-origin',
        name: 'GINGERcaps NO VEGANA',
        shortName: 'EL ORIGEN',
        concentration: '500mg • Extracto puro',
        tag: 'BESTSELLER',
        tagType: 'gold',
        image: 'original.jpg',
        imageAlt: 'GINGERcaps ORIGIN - Cápsulas de jengibre 500mg',
        desc: 'El poder ancestral del jengibre en su forma más pura. Extracto estandarizado al 5% de gingerol.',
        longDesc: 'GINGERcaps ORIGIN representa la esencia misma del jengibre. Cultivado en las montañas de la India, seleccionado a mano y procesado con técnicas que preservan sus compuestos bioactivos.',
        price: 60,
        oldPrice: 89,
        rating: 4.9,
        reviews: 342,
        benefits: ['🌿 100% Orgánico', '⚡ Energía Natural', '🛡️ Sistema Inmune', '🔥 Antiinflamatorio'],
        ritual: 'Tomar 1 cápsula cada mañana con agua tibia y limón.'
    },
    {
        id: 'ginger-elixir',
        name: 'GINGERcaps VEGANA',
        shortName: 'EL ELIXIR',
        concentration: '1000mg • Black Ginger',
        tag: 'EDICIÓN LIMITADA',
        tagType: 'crimson',
        image: 'pro.jpg',
        imageAlt: 'GINGERcaps ELIXIR - Black Ginger 1000mg',
        desc: 'Black Ginger combinado con jengibre tradicional. Potencia, vitalidad y rendimiento.',
        longDesc: 'GINGERcaps ELIXIR utiliza Black Ginger, conocido como "ginseng tailandés", combinado con jengibre tradicional de alta concentración.',
        price: 70,
        oldPrice: 99,
        rating: 5.0,
        reviews: 128,
        benefits: ['💪 Rendimiento Máximo', '⚡ Energía Extrema', '🧠 Enfoque Mental', '❤️ Circulación'],
        ritual: 'Tomar 1 cápsula 30 minutos antes del entrenamiento o actividad intensa.'
    }
];

// ─── Manejo de errores de imagen SIN onerror inline ─────────────────────────

function handleImageError(imgElement, productType) {
    const parent = imgElement.parentElement;
    const isGold = productType === 'gold';
    parent.innerHTML = `<span class="emoji-fallback" style="font-size: 64px; display: block;">${isGold ? '🫚' : '✨'}</span>`;
}

function setupImageErrorHandlers() {
    document.querySelectorAll('.product-img').forEach(img => {
        img.removeEventListener('error', img._errorHandler);
        const handler = () => {
            const card = img.closest('.product-card');
            const isGold = card?.querySelector('.badge-gold') !== null;
            img.parentElement.innerHTML = `<span class="emoji-fallback" style="font-size: 64px; display: block;">${isGold ? '🫚' : '✨'}</span>`;
        };
        img._errorHandler = handler;
        img.addEventListener('error', handler);
    });
}

// ─── Render helpers ──────────────────────────────────────────────────────────

function renderProducts() {
    return PRODUCTS.map(p => {
        const saving = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        const badgeClass = p.tagType === 'gold' ? 'badge-gold' : 'badge-crimson';
        
        return `
            <div class="product-card animate-on-scroll" data-product-id="${p.id}" data-product-type="${p.tagType}">
                <div class="product-badge ${badgeClass}">
                    ${p.tagType === 'gold' ? '⭐ ' : '✦ '}${p.tag}
                </div>
                <div class="product-visual">
                    <img 
                        src="/assets/images/products/${p.image}" 
                        alt="${p.imageAlt}"
                        class="product-img"
                        loading="lazy"
                    >
                </div>
                <div class="product-concentration">${p.concentration}</div>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-description">${p.desc}</p>
                <ul class="product-benefits-list">
                    ${p.benefits.map(b => `<li>${b}</li>`).join('')}
                </ul>
                <div class="product-price-row">
                    <span class="price-current">$${p.price}</span>
                    <span class="price-old">$${p.oldPrice}</span>
                    <span class="price-save">−${saving}%</span>
                </div>
                <button class="btn-add-cart" data-product='${JSON.stringify({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.image
                })}'>
                    <span>🛍️</span>
                    Agregar al carrito
                </button>
            </div>
        `;
    }).join('');
}

// ─── Template principal ──────────────────────────────────────────────────────

function getShopHTML() {
    return `
    <div class="shop-page">
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
                        Dos fórmulas únicas, un mismo propósito: tu bienestar.
                        Descubre la alquimia perfecta entre tradición milenaria y ciencia moderna.
                    </p>
                </div>
            </div>
        </section>

        <section class="products-showcase">
            <div class="container-shop">
                <div class="section-header animate-on-scroll">
                    <span class="section-eyebrow">✦ Nuestras fórmulas ✦</span>
                    <h2 class="section-title">
                        Dos alquimias, <em>un origen</em>
                    </h2>
                    <p class="section-subtitle">
                        Cada fórmula ha sido diseñada para un propósito específico
                    </p>
                </div>

                <div class="products-duo">
                    ${renderProducts()}
                </div>
            </div>
        </section>

        <section class="comparison-section">
            <div class="container-shop">
                <div class="comparison-grid">
                    <div class="comparison-item animate-on-scroll animate-delay-1">
                        <div class="comparison-icon">🌿</div>
                        <h3 class="comparison-title">Origen Sagrado</h3>
                        <p class="comparison-text">Cultivado en montañas donde la tierra es más pura.</p>
                    </div>
                    <div class="comparison-item animate-on-scroll animate-delay-2">
                        <div class="comparison-icon">⚗️</div>
                        <h3 class="comparison-title">Alquimia Moderna</h3>
                        <p class="comparison-text">Extracción que preserva todos los compuestos bioactivos.</p>
                    </div>
                    <div class="comparison-item animate-on-scroll animate-delay-3">
                        <div class="comparison-icon">✨</div>
                        <h3 class="comparison-title">Transformación</h3>
                        <p class="comparison-text">Resultados desde la primera semana.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
    `;
}

// ─── Scroll Animations ─────────────────────────────────────────────────────

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
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ─── Add to Cart ───────────────────────────────────────────────────────────

function initAddToCart() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productData = JSON.parse(btn.dataset.product);

            btn.style.transform = 'scale(0.95)';
            setTimeout(() => { btn.style.transform = ''; }, 200);

            store.addToCart({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                quantity: 1,
            });

            showNotification(`🫚 ${productData.name} agregado al carrito`, 'success');
            updateCartBadge();
            if (typeof bumpCartBadge === 'function') bumpCartBadge();
        });
    });
}

// ─── Modal de producto SIN onerror inline ───────────────────────────────────

function initProductModal() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add-cart')) return;
            
            const productId = card.dataset.productId;
            const product = PRODUCTS.find(p => p.id === productId);
            if (!product) return;

            const saving = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            const badgeClass = product.tagType === 'gold' ? 'badge-gold' : 'badge-crimson';

            const modal = document.createElement('div');
            modal.className = 'modal-shop';
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                    <button class="modal-close">✕</button>
                    <div class="modal-grid">
                        <div class="modal-image">
                            <img 
                                src="/assets/images/products/${product.image}" 
                                alt="${product.imageAlt}"
                                class="modal-img"
                                loading="lazy"
                            >
                        </div>
                        <div class="modal-info">
                            <div class="product-badge ${badgeClass}" style="margin-bottom: 16px;">
                                ${product.tagType === 'gold' ? '⭐ ' : '✦ '}${product.tag}
                            </div>
                            <h2 class="modal-title">${product.name}</h2>
                            <div class="modal-rating">
                                <span>★</span>
                                <span>${product.rating}</span>
                                <span style="color: var(--bark-light);">(${product.reviews} reseñas)</span>
                            </div>
                            <div class="modal-price">
                                <span class="current">$${product.price}</span>
                                <span class="old" style="text-decoration: line-through; margin-left: 12px;">$${product.oldPrice}</span>
                                <span class="price-save" style="margin-left: 12px;">−${saving}%</span>
                            </div>
                            <p class="modal-description">${product.longDesc}</p>
                            
                            <div class="modal-features">
                                ${product.benefits.map(b => `<span class="modal-feature">${b}</span>`).join('')}
                            </div>
                            
                            <div class="ritual-box">
                                <span><i class="fas fa-feather-alt"></i> Ritual de consumo</span>
                                <p style="color: var(--bark-light); font-size: var(--font-size-sm);">${product.ritual}</p>
                            </div>
                            
                            <button class="btn-add-cart-modal btn-add-cart" data-product='${JSON.stringify({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image
                            })}' style="margin-top: 16px;">
                                <span>🛍️</span>
                                Agregar al carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('active'), 10);

            // Manejar error de imagen en modal
            const modalImg = modal.querySelector('.modal-img');
            if (modalImg) {
                modalImg.addEventListener('error', function() {
                    const isGold = product.tagType === 'gold';
                    this.parentElement.innerHTML = `<span class="emoji-fallback" style="font-size: 80px;">${isGold ? '🫚' : '✨'}</span>`;
                });
            }

            const closeModal = () => {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            };

            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

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
                        quantity: 1,
                    });
                    
                    showNotification(`🫚 ${productData.name} agregado al carrito`, 'success');
                    updateCartBadge();
                    if (typeof bumpCartBadge === 'function') bumpCartBadge();
                    closeModal();
                });
            }
        });
    });
}

// ─── View Class ──────────────────────────────────────────────────────────────

export default class ShopView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this._observers = [];
    }

    async render() {
        this.container.innerHTML = getShopHTML();

        await new Promise(r => requestAnimationFrame(r));

        initScrollAnimations();
        initAddToCart();
        initProductModal();
        setupImageErrorHandlers();
        updateCartBadge();

        return this;
    }

    destroy() {
        this._observers.forEach(o => o.disconnect());
        this._observers = [];
    }
}