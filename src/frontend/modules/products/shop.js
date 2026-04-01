/**
 * Módulo Tienda - Catálogo de productos GINGERcaps
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
    }
    
    async render() {
        this.loadProducts();
        
        this.container.innerHTML = `
            <div class="shop-page">
                <div class="shop-hero">
                    <div class="container">
                        <h1>Nuestras cápsulas</h1>
                        <p>Descubre el poder del jengibre en cada dosis</p>
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
                                    <input type="range" id="price-min" min="0" max="1500" value="0">
                                    <input type="range" id="price-max" min="0" max="1500" value="1500">
                                    <div class="price-values">
                                        <span>$$<span id="min-value">0</span></span>
                                        <span>$$<span id="max-value">1500</span></span>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn-clear-filters" id="clear-filters">Limpiar filtros</button>
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
                                    <i class="fas fa-spinner fa-spin"></i>
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
                category: 'original',
                concentration: '500mg',
                price: 349,
                oldPrice: 499,
                rating: 4.8,
                reviews: 128,
                description: 'Extracto puro de jengibre estandarizado al 5% de gingerol',
                benefits: ['Antiinflamatorio', 'Digestión', 'Energía'],
                badge: 'Más vendido',
                stock: 150,
                image: 'capsules'
            },
            {
                id: 2,
                name: 'GINGERcaps Plus',
                category: 'plus',
                concentration: '1000mg',
                price: 449,
                oldPrice: 649,
                rating: 4.9,
                reviews: 89,
                description: 'Doble concentración para resultados intensificados',
                benefits: ['Inmunidad', 'Rendimiento', 'Recuperación'],
                badge: 'Recomendado',
                stock: 89,
                image: 'capsules'
            },
            {
                id: 3,
                name: 'GINGERcaps Pro',
                category: 'pro',
                concentration: '1500mg',
                price: 549,
                oldPrice: 799,
                rating: 5.0,
                reviews: 45,
                description: 'Fórmula premium con complejo de vitaminas',
                benefits: ['Rendimiento máximo', 'Energía extrema', 'Bienestar total'],
                badge: 'Nuevo',
                stock: 45,
                image: 'capsules'
            },
            {
                id: 4,
                name: 'Kit Detox 30 Días',
                category: 'kits',
                concentration: '500mg',
                price: 899,
                oldPrice: 1299,
                rating: 4.8,
                reviews: 67,
                description: '2 frascos de Original + Guía de bienestar',
                benefits: ['Desintoxicación', 'Energía sostenida', 'Resultados garantizados'],
                badge: 'Ahorra 30%',
                stock: 32,
                image: 'kit'
            },
            {
                id: 5,
                name: 'Kit Rendimiento Máximo',
                category: 'kits',
                concentration: '1000mg',
                price: 1199,
                oldPrice: 1699,
                rating: 4.9,
                reviews: 42,
                description: '2 frascos de Plus + Shaker exclusivo',
                benefits: ['Rendimiento deportivo', 'Recuperación muscular', 'Energía prolongada'],
                badge: 'Edición especial',
                stock: 28,
                image: 'kit'
            },
            {
                id: 6,
                name: 'Kit Familiar 90 Días',
                category: 'kits',
                concentration: '500mg + 1000mg',
                price: 1599,
                oldPrice: 2299,
                rating: 5.0,
                reviews: 23,
                description: 'Original + Plus + Pro, ideal para toda la familia',
                benefits: ['Bienestar completo', 'Para todos', 'Ahorro máximo'],
                badge: 'Mejor precio',
                stock: 15,
                image: 'kit'
            }
        ];
        
        this.filteredProducts = [...this.products];
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
                    <div class="image-placeholder">
                        <i class="fas ${product.image === 'capsules' ? 'fa-capsules' : 'fa-boxes'}"></i>
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
                        ${product.benefits.map(b => `<span class="benefit-tag">${b}</span>`).join('')}
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
        
        // Event listeners para botones
        document.querySelectorAll('.btn-quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const product = this.products.find(p => p.id === id);
                if (product) {
                    this.showQuickView(product);
                }
            });
        });
        
        document.querySelectorAll('.btn-add-cart-shop').forEach(btn => {
            btn.addEventListener('click', (e) => {
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
                }
            });
        });
        
        // Event listeners para tarjetas (navegación a detalle)
        document.querySelectorAll('.product-card-shop').forEach(card => {
            card.addEventListener('click', (e) => {
                // Evitar si se hizo clic en un botón
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
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });
        
        // Filtro de precio
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const minValue = document.getElementById('min-value');
        const maxValue = document.getElementById('max-value');
        
        if (priceMin && priceMax) {
            priceMin.addEventListener('input', () => {
                minValue.textContent = priceMin.value;
                this.applyFilters();
            });
            
            priceMax.addEventListener('input', () => {
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
        const maxPrice = parseInt(document.getElementById('price-max')?.value || 1500);
        
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
        // Resetear categoría
        this.currentCategory = 'all';
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Resetear concentración
        document.querySelectorAll('.filter-checkbox input').forEach(cb => {
            cb.checked = false;
        });
        
        // Resetear precio
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const minValue = document.getElementById('min-value');
        const maxValue = document.getElementById('max-value');
        
        if (priceMin) priceMin.value = 0;
        if (priceMax) priceMax.value = 1500;
        if (minValue) minValue.textContent = '0';
        if (maxValue) maxValue.textContent = '1500';
        
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
                        <i class="fas fa-capsules"></i>
                    </div>
                    <div class="quickview-info">
                        <div class="quickview-badge">${product.badge}</div>
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
                        <p class="quickview-description">${product.description}</p>
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
        
        const closeBtn = modal.querySelector('.quickview-close');
        const overlay = modal.querySelector('.quickview-overlay');
        
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        const addBtn = modal.querySelector('.btn-add-cart-quick');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
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
    }
    
    destroy() {}
}