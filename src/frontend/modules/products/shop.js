/**
 * Módulo Tienda - Catálogo de productos GINGERcaps
 * Versión mejorada con soporte para imágenes reales
 */

import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, updateCartBadge } from '../../utils/cartUtils.js';

export default class ShopView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.currentSort = 'popular';
        this.searchQuery = '';
        this.imagesLoaded = false;
    }
    
    async render() {
        this.loadProducts();
        
        this.container.innerHTML = `
            <div class="shop-page">
                <div class="shop-hero">
                    <div class="container">
                        <div class="shop-hero-content">
                            <h1>Nuestras cápsulas</h1>
                            <p>Descubre el poder del jengibre en cada dosis</p>
                        </div>
                    </div>
                </div>
                
                <div class="container">
                    <div class="shop-layout">
                        <!-- Sidebar Filtros -->
                        <aside class="shop-sidebar">
                            <div class="filter-section">
                                <h3>Categorías</h3>
                                <div class="filter-categories">
                                    <button class="filter-btn active" data-category="all">Todos los productos</button>
                                    <button class="filter-btn" data-category="original">GINGERcaps Original</button>
                                    <button class="filter-btn" data-category="plus">GINGERcaps Plus</button>
                                    <button class="filter-btn" data-category="pro">GINGERcaps Pro</button>
                                    <button class="filter-btn" data-category="kits">Kits y Combos</button>
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <h3>Concentración</h3>
                                <div class="filter-options">
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="500mg"> 500mg
                                    </label>
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="1000mg"> 1000mg
                                    </label>
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="1500mg"> 1500mg
                                    </label>
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <h3>Precio</h3>
                                <div class="price-range">
                                    <input type="range" id="price-min" min="0" max="2000" value="0">
                                    <input type="range" id="price-max" min="0" max="2000" value="2000">
                                    <div class="price-values">
                                        <span>$$<span id="min-value">0</span></span>
                                        <span>$$<span id="max-value">2000</span></span>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn-clear-filters" id="clear-filters">
                                <i class="fas fa-undo-alt"></i> Limpiar filtros
                            </button>
                        </aside>
                        
                        <!-- Main Content -->
                        <main class="shop-main">
                            <div class="shop-header">
                                <div class="results-count" id="results-count">Cargando productos...</div>
                                <div class="sort-options">
                                    <select id="sort-select" class="sort-select">
                                        <option value="popular">Más populares</option>
                                        <option value="price-asc">Precio: menor a mayor</option>
                                        <option value="price-desc">Precio: mayor a menor</option>
                                        <option value="name">Nombre: A-Z</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="products-grid" id="products-grid">
                                <div class="loading-products">
                                    <div class="loading-spinner"></div>
                                    <p>Cargando productos...</p>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;
        
        this.initFilters();
        this.initSort();
        this.renderProducts();
        
        return this;
    }
    
    loadProducts() {
        this.products = [
            {
                id: 1,
                name: 'GINGERcaps Original',
                slug: 'gingercaps-original',
                category: 'original',
                concentration: '500mg',
                price: 349,
                oldPrice: 499,
                rating: 4.8,
                reviews: 128,
                description: 'Extracto puro de jengibre estandarizado al 5% de gingerol. Ideal para el bienestar diario.',
                longDescription: 'GINGERcaps Original es la forma más pura de obtener los beneficios del jengibre. Cada cápsula contiene 500mg de extracto de jengibre estandarizado al 5% de gingerol, el compuesto activo responsable de sus propiedades antiinflamatorias y antioxidantes.',
                benefits: ['Antiinflamatorio natural', 'Mejora la digestión', 'Aumenta la energía', 'Fortalece el sistema inmune'],
                badge: 'Más vendido',
                stock: 150,
                image: 'original',
                images: ['original-main', 'original-2', 'original-3']
            },
            {
                id: 2,
                name: 'GINGERcaps Plus',
                slug: 'gingercaps-plus',
                category: 'plus',
                concentration: '1000mg',
                price: 449,
                oldPrice: 649,
                rating: 4.9,
                reviews: 89,
                description: 'Doble concentración para resultados intensificados y soporte inmunológico superior.',
                longDescription: 'GINGERcaps Plus ofrece el doble de potencia. Con 1000mg de extracto de jengibre por cápsula, está diseñado para quienes buscan resultados más rápidos y una mayor protección inmunológica.',
                benefits: ['Inmunidad fortalecida', 'Reducción de náuseas', 'Rendimiento deportivo', 'Recuperación muscular'],
                badge: 'Recomendado',
                stock: 89,
                image: 'plus',
                images: ['plus-main', 'plus-2', 'plus-3']
            },
            {
                id: 3,
                name: 'GINGERcaps Pro',
                slug: 'gingercaps-pro',
                category: 'pro',
                concentration: '1500mg',
                price: 549,
                oldPrice: 799,
                rating: 5.0,
                reviews: 45,
                description: 'Fórmula premium con máxima potencia y complejo de vitaminas.',
                longDescription: 'GINGERcaps Pro es nuestra fórmula más avanzada. Combina 1500mg de extracto de jengibre con un complejo vitamínico para potenciar la absorción y maximizar los beneficios. Ideal para deportistas y personas con alta demanda energética.',
                benefits: ['Rendimiento máximo', 'Energía extrema', 'Bienestar total', 'Recuperación acelerada'],
                badge: 'Nuevo',
                stock: 45,
                image: 'pro',
                images: ['pro-main', 'pro-2', 'pro-3']
            },
            {
                id: 4,
                name: 'Kit Detox 30 Días',
                slug: 'kit-detox-30-dias',
                category: 'kits',
                concentration: '500mg',
                price: 899,
                oldPrice: 1299,
                rating: 4.8,
                reviews: 67,
                description: '2 frascos de Original + Guía de bienestar. Ideal para comenzar tu rutina.',
                longDescription: 'El Kit Detox incluye 2 frascos de GINGERcaps Original y una guía digital con consejos de bienestar, recetas y rutinas para potenciar los efectos del jengibre en tu cuerpo.',
                benefits: ['Desintoxicación', 'Energía sostenida', 'Resultados garantizados', 'Ahorro del 30%'],
                badge: 'Ahorra 30%',
                stock: 32,
                image: 'kit-detox',
                images: ['kit-detox-main', 'kit-detox-2']
            },
            {
                id: 5,
                name: 'Kit Rendimiento Máximo',
                slug: 'kit-rendimiento-maximo',
                category: 'kits',
                concentration: '1000mg',
                price: 1199,
                oldPrice: 1699,
                rating: 4.9,
                reviews: 42,
                description: '2 frascos de Plus + Shaker exclusivo para deportistas.',
                longDescription: 'El Kit Rendimiento Máximo incluye 2 frascos de GINGERcaps Plus y un shaker deportivo de edición limitada. Perfecto para quienes buscan mejorar su rendimiento físico y recuperación.',
                benefits: ['Rendimiento deportivo', 'Recuperación muscular', 'Energía prolongada', 'Ahorro del 29%'],
                badge: 'Edición especial',
                stock: 28,
                image: 'kit-performance',
                images: ['kit-performance-main', 'kit-performance-2']
            },
            {
                id: 6,
                name: 'Kit Familiar 90 Días',
                slug: 'kit-familiar-90-dias',
                category: 'kits',
                concentration: '500mg + 1000mg',
                price: 1599,
                oldPrice: 2299,
                rating: 5.0,
                reviews: 23,
                description: 'Original + Plus + Pro, ideal para toda la familia.',
                longDescription: 'El Kit Familiar incluye las tres fórmulas GINGERcaps: Original, Plus y Pro. Cada miembro de la familia puede elegir la concentración que mejor se adapte a sus necesidades. Ahorro máximo y bienestar para todos.',
                benefits: ['Bienestar completo', 'Para todos los niveles', 'Ahorro máximo', '90 días de suministro'],
                badge: 'Mejor precio',
                stock: 15,
                image: 'kit-family',
                images: ['kit-family-main', 'kit-family-2']
            }
        ];
        
        this.filteredProducts = [...this.products];
    }
    
    getProductImageUrl(product) {
        // Si hay imagen personalizada, usarla, si no, usar placeholder
        return `/assets/images/products/${product.image}.jpg`;
    }
    
    renderProducts() {
        const grid = document.getElementById('products-grid');
        const resultsCount = document.getElementById('results-count');
        
        if (!grid) return;
        
        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No encontramos productos</h3>
                    <p>Intenta con otros filtros o categorías</p>
                    <button class="btn-clear-filters" id="clear-filters-empty">Limpiar filtros</button>
                </div>
            `;
            
            const clearBtn = document.getElementById('clear-filters-empty');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearAllFilters());
            }
            
            resultsCount.textContent = '0 productos encontrados';
            return;
        }
        
        resultsCount.textContent = `${this.filteredProducts.length} productos encontrados`;
        
        grid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card-shop" data-product-id="${product.id}">
                <div class="product-badge-shop ${this.getBadgeClass(product.badge)}">${product.badge}</div>
                <div class="product-image-shop">
                    <div class="image-container">
                        <img 
                            src="${this.getProductImageUrl(product)}" 
                            alt="${product.name}"
                            class="product-image"
                            loading="lazy"
                            onerror="this.src='/assets/images/products/placeholder.jpg'"
                        >
                    </div>
                </div>
                <div class="product-info-shop">
                    <h3>${product.name}</h3>
                    <div class="product-meta-shop">
                        <span class="concentration"><i class="fas fa-weight-hanging"></i> ${product.concentration}</span>
                        <div class="product-rating-shop">
                            <i class="fas fa-star"></i>
                            <span>${product.rating}</span>
                            <span class="reviews">(${product.reviews})</span>
                        </div>
                    </div>
                    <p class="product-desc-shop">${product.description}</p>
                    <div class="product-benefits-shop">
                        ${product.benefits.slice(0, 3).map(b => `<span class="benefit-tag">${b}</span>`).join('')}
                    </div>
                    <div class="product-price-shop">
                        <span class="current">${formatPrice(product.price)}</span>
                        <span class="old">${formatPrice(product.oldPrice)}</span>
                    </div>
                    <div class="product-actions-shop">
                        <button class="btn-quick-view" data-id="${product.id}">
                            <i class="fas fa-eye"></i> Vista rápida
                        </button>
                        <button class="btn-add-cart-shop" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.initProductEvents();
    }
    
    initProductEvents() {
        // Vista rápida
        document.querySelectorAll('.btn-quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const product = this.products.find(p => p.id === id);
                if (product) this.showQuickView(product);
            });
        });
        
        // Agregar al carrito
        document.querySelectorAll('.btn-add-cart-shop').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const product = this.products.find(p => p.id === id);
                if (product) {
                    store.addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        concentration: product.concentration
                    });
                    showNotification(`${product.name} agregado al carrito`, 'success');
                    updateCartBadge();
                    
                    // Animación del botón
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => btn.style.transform = '', 200);
                }
            });
        });
        
        // Navegación a detalle
        document.querySelectorAll('.product-card-shop').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-quick-view') || e.target.closest('.btn-add-cart-shop')) return;
                const productId = card.dataset.productId;
                window.location.href = `/producto/${productId}`;
            });
        });
    }
    
    getBadgeClass(badge) {
        if (badge.includes('vendido')) return 'popular';
        if (badge.includes('Nuevo')) return 'new';
        if (badge.includes('Ahorra')) return 'sale';
        if (badge.includes('precio')) return 'sale';
        if (badge.includes('Edición')) return 'special';
        return 'default';
    }
    
    initFilters() {
        // Filtro de categorías
        const categoryBtns = document.querySelectorAll('.filter-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.applyFilters();
            });
        });
        
        // Filtro de concentración
        const concentrationCheckboxes = document.querySelectorAll('.filter-checkbox input');
        concentrationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });
        
        // Filtro de precio
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const minValue = document.getElementById('min-value');
        const maxValue = document.getElementById('max-value');
        
        if (priceMin && priceMax) {
            priceMin.addEventListener('input', () => {
                if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
                    priceMin.value = priceMax.value;
                }
                minValue.textContent = priceMin.value;
                this.applyFilters();
            });
            
            priceMax.addEventListener('input', () => {
                if (parseInt(priceMax.value) < parseInt(priceMin.value)) {
                    priceMax.value = priceMin.value;
                }
                maxValue.textContent = priceMax.value;
                this.applyFilters();
            });
        }
        
        // Botón limpiar filtros
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }
    }
    
    initSort() {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentSort = sortSelect.value;
                this.applySort();
                this.renderProducts();
            });
        }
    }
    
    applyFilters() {
        let filtered = [...this.products];
        
        // Filtro por categoría
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.currentCategory);
        }
        
        // Filtro por concentración
        const selectedConcentrations = Array.from(document.querySelectorAll('.filter-checkbox input:checked'))
            .map(cb => cb.value);
        
        if (selectedConcentrations.length > 0) {
            filtered = filtered.filter(p => selectedConcentrations.includes(p.concentration));
        }
        
        // Filtro por precio
        const minPrice = parseInt(document.getElementById('price-min')?.value || 0);
        const maxPrice = parseInt(document.getElementById('price-max')?.value || 2000);
        
        filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
        
        this.filteredProducts = filtered;
        this.applySort();
        this.renderProducts();
    }
    
    applySort() {
        switch(this.currentSort) {
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'popular':
            default:
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
        }
    }
    
    clearAllFilters() {
        this.currentCategory = 'all';
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        document.querySelectorAll('.filter-checkbox input').forEach(cb => {
            cb.checked = false;
        });
        
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const minValue = document.getElementById('min-value');
        const maxValue = document.getElementById('max-value');
        
        if (priceMin) priceMin.value = 0;
        if (priceMax) priceMax.value = 2000;
        if (minValue) minValue.textContent = '0';
        if (maxValue) maxValue.textContent = '2000';
        
        this.applyFilters();
    }
    
    showQuickView(product) {
        const modal = document.createElement('div');
        modal.className = 'quickview-modal';
        modal.innerHTML = `
            <div class="quickview-overlay"></div>
            <div class="quickview-content">
                <button class="quickview-close">&times;</button>
                <div class="quickview-grid">
                    <div class="quickview-image">
                        <img 
                            src="${this.getProductImageUrl(product)}" 
                            alt="${product.name}"
                            class="quickview-img"
                            onerror="this.src='/assets/images/products/placeholder.jpg'"
                        >
                    </div>
                    <div class="quickview-info">
                        <div class="quickview-badge ${this.getBadgeClass(product.badge)}">${product.badge}</div>
                        <h2>${product.name}</h2>
                        <div class="quickview-rating">
                            <i class="fas fa-star"></i>
                            <span>${product.rating}</span>
                            <span class="reviews">(${product.reviews} reseñas)</span>
                        </div>
                        <div class="quickview-price">
                            <span class="current">${formatPrice(product.price)}</span>
                            <span class="old">${formatPrice(product.oldPrice)}</span>
                        </div>
                        <p class="quickview-description">${product.longDescription || product.description}</p>
                        <div class="quickview-benefits">
                            <strong>Beneficios:</strong>
                            <div class="benefits-list">
                                ${product.benefits.map(b => `<span class="benefit-tag">${b}</span>`).join('')}
                            </div>
                        </div>
                        <div class="quickview-actions">
                            <button class="btn-add-cart-quick" data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i> Agregar al carrito
                            </button>
                            <a href="/producto/${product.id}" class="btn-view-detail" data-link>
                                Ver detalles
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => modal.remove();
        modal.querySelector('.quickview-close').addEventListener('click', closeModal);
        modal.querySelector('.quickview-overlay').addEventListener('click', closeModal);
        
        modal.querySelector('.btn-add-cart-quick').addEventListener('click', () => {
            store.addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                concentration: product.concentration
            });
            showNotification(`${product.name} agregado al carrito`, 'success');
            updateCartBadge();
            modal.remove();
        });
    }
    
    destroy() {}
}