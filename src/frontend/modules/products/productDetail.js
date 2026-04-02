/**
 * Módulo Detalle de Producto - Dinámico
 */

import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, updateCartBadge } from '../../utils/cartUtils.js';

// Datos de productos (deberían venir del backend, pero por ahora local)
const PRODUCTS = {
    1: {
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
        longDescription: 'GINGERcaps Original es la forma más pura de obtener los beneficios del jengibre. Cada cápsula contiene 500mg de extracto de jengibre estandarizado al 5% de gingerol, el compuesto activo responsable de sus propiedades antiinflamatorias y antioxidantes. Nuestro proceso de extracción garantiza la máxima biodisponibilidad para que tu cuerpo absorba todos los beneficios.',
        benefits: ['Antiinflamatorio natural', 'Mejora la digestión', 'Aumenta la energía', 'Fortalece el sistema inmune'],
        badge: 'Más vendido',
        stock: 150,
        image: 'original',
        images: ['original-main', 'original-2', 'original-3']
    },
    2: {
        id: 2,
        name: 'GINGERcaps Plus',
        slug: 'gingercaps-plus',
        category: 'plus',
        concentration: '1000mg',
        price: 449,
        oldPrice: 649,
        rating: 4.9,
        reviews: 89,
        description: 'Doble concentración para resultados intensificados.',
        longDescription: 'GINGERcaps Plus ofrece el doble de potencia. Con 1000mg de extracto de jengibre por cápsula, está diseñado para quienes buscan resultados más rápidos y una mayor protección inmunológica. Ideal para deportistas y personas con alta demanda energética.',
        benefits: ['Inmunidad fortalecida', 'Reducción de náuseas', 'Rendimiento deportivo', 'Recuperación muscular'],
        badge: 'Recomendado',
        stock: 89,
        image: 'plus',
        images: ['plus-main', 'plus-2', 'plus-3']
    },
    3: {
        id: 3,
        name: 'GINGERcaps Pro',
        slug: 'gingercaps-pro',
        category: 'pro',
        concentration: '1500mg',
        price: 549,
        oldPrice: 799,
        rating: 5.0,
        reviews: 45,
        description: 'Fórmula premium con máxima potencia.',
        longDescription: 'GINGERcaps Pro es nuestra fórmula más avanzada. Combina 1500mg de extracto de jengibre con un complejo vitamínico para potenciar la absorción y maximizar los beneficios. Perfecto para atletas de alto rendimiento y personas que buscan el máximo bienestar.',
        benefits: ['Rendimiento máximo', 'Energía extrema', 'Bienestar total', 'Recuperación acelerada'],
        badge: 'Nuevo',
        stock: 45,
        image: 'pro',
        images: ['pro-main', 'pro-2', 'pro-3']
    },
    4: {
        id: 4,
        name: 'Kit Detox 30 Días',
        slug: 'kit-detox-30-dias',
        category: 'kits',
        concentration: '500mg',
        price: 899,
        oldPrice: 1299,
        rating: 4.8,
        reviews: 67,
        description: '2 frascos de Original + Guía de bienestar.',
        longDescription: 'El Kit Detox incluye 2 frascos de GINGERcaps Original y una guía digital con consejos de bienestar, recetas y rutinas para potenciar los efectos del jengibre en tu cuerpo. Ideal para comenzar tu viaje hacia el bienestar natural.',
        benefits: ['Desintoxicación', 'Energía sostenida', 'Resultados garantizados', 'Ahorro del 30%'],
        badge: 'Ahorra 30%',
        stock: 32,
        image: 'kit-detox',
        images: ['kit-detox-main', 'kit-detox-2']
    },
    5: {
        id: 5,
        name: 'Kit Rendimiento Máximo',
        slug: 'kit-rendimiento-maximo',
        category: 'kits',
        concentration: '1000mg',
        price: 1199,
        oldPrice: 1699,
        rating: 4.9,
        reviews: 42,
        description: '2 frascos de Plus + Shaker exclusivo.',
        longDescription: 'El Kit Rendimiento Máximo incluye 2 frascos de GINGERcaps Plus y un shaker deportivo de edición limitada. Perfecto para quienes buscan mejorar su rendimiento físico y recuperación muscular. Diseñado para atletas y personas activas.',
        benefits: ['Rendimiento deportivo', 'Recuperación muscular', 'Energía prolongada', 'Ahorro del 29%'],
        badge: 'Edición especial',
        stock: 28,
        image: 'kit-performance',
        images: ['kit-performance-main', 'kit-performance-2']
    },
    6: {
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
};

export default class ProductDetailView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.productId = parseInt(params.id);
        this.product = PRODUCTS[this.productId];
        this.quantity = 1;
    }
    
    async render() {
        if (!this.product) {
            this.container.innerHTML = `
                <div class="product-not-found">
                    <div class="container">
                        <i class="fas fa-search"></i>
                        <h2>Producto no encontrado</h2>
                        <p>El producto que buscas no existe o ha sido descontinuado.</p>
                        <a href="/tienda" class="btn-primary" data-link>Ver todos los productos</a>
                    </div>
                </div>
            `;
            return this;
        }
        
        this.container.innerHTML = `
            <div class="product-detail-page">
                <div class="container">
                    <div class="product-detail-breadcrumb">
                        <a href="/" data-link>Inicio</a>
                        <span>/</span>
                        <a href="/tienda" data-link>Tienda</a>
                        <span>/</span>
                        <span class="current">${this.product.name}</span>
                    </div>
                    
                    <div class="product-detail-grid">
                        <!-- Galería de imágenes -->
                        <div class="product-gallery">
                            <div class="main-image">
                                <img 
                                    src="/assets/images/products/${this.product.image}.jpg" 
                                    alt="${this.product.name}"
                                    id="main-product-image"
                                    onerror="this.src='/assets/images/products/placeholder.jpg'"
                                >
                            </div>
                            <div class="thumbnail-list" id="thumbnail-list">
                                ${this.product.images.map((img, index) => `
                                    <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${img}">
                                        <img src="/assets/images/products/${img}.jpg" alt="${this.product.name} - vista ${index + 1}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Información del producto -->
                        <div class="product-info-detail">
                            <div class="product-badge ${this.getBadgeClass()}">${this.product.badge}</div>
                            <h1>${this.product.name}</h1>
                            
                            <div class="product-rating">
                                <div class="stars">
                                    ${this.renderStars(this.product.rating)}
                                </div>
                                <span class="rating-value">${this.product.rating}</span>
                                <span class="reviews">(${this.product.reviews} reseñas)</span>
                            </div>
                            
                            <div class="product-price-detail">
                                <span class="current">${formatPrice(this.product.price)}</span>
                                <span class="old">${formatPrice(this.product.oldPrice)}</span>
                                <span class="discount">-${Math.round((1 - this.product.price / this.product.oldPrice) * 100)}%</span>
                            </div>
                            
                            <p class="product-description">${this.product.longDescription}</p>
                            
                            <div class="product-details">
                                <div class="detail-item">
                                    <i class="fas fa-weight-hanging"></i>
                                    <span>Concentración: <strong>${this.product.concentration}</strong></span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-boxes"></i>
                                    <span>Stock: <strong>${this.product.stock} unidades</strong></span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-leaf"></i>
                                    <span>100% Natural</span>
                                </div>
                            </div>
                            
                            <div class="product-benefits">
                                <h3>Beneficios:</h3>
                                <ul>
                                    ${this.product.benefits.map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="product-actions">
                                <div class="quantity-selector">
                                    <button class="qty-btn minus" id="qty-minus">-</button>
                                    <input type="number" value="1" min="1" max="${this.product.stock}" id="product-quantity">
                                    <button class="qty-btn plus" id="qty-plus">+</button>
                                </div>
                                <button id="add-to-cart-detail" class="btn-add-cart-detail">
                                    <i class="fas fa-shopping-cart"></i> Agregar al carrito
                                </button>
                            </div>
                            
                            <div class="product-meta">
                                <div class="meta-item">
                                    <i class="fas fa-truck"></i>
                                    <span>Envío gratis en pedidos +$500</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-undo-alt"></i>
                                    <span>Devoluciones hasta 30 días</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Garantía de calidad</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initGallery();
        this.initQuantitySelector();
        this.initAddToCart();
        
        return this;
    }
    
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalf) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    getBadgeClass() {
        const badge = this.product.badge;
        if (badge.includes('vendido')) return 'popular';
        if (badge.includes('Nuevo')) return 'new';
        if (badge.includes('Ahorra')) return 'sale';
        if (badge.includes('precio')) return 'sale';
        if (badge.includes('Edición')) return 'special';
        return 'default';
    }
    
    initGallery() {
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                const imgSrc = thumb.dataset.image;
                mainImage.src = `/assets/images/products/${imgSrc}.jpg`;
                mainImage.onerror = () => mainImage.src = '/assets/images/products/placeholder.jpg';
            });
        });
    }
    
    initQuantitySelector() {
        const minusBtn = document.getElementById('qty-minus');
        const plusBtn = document.getElementById('qty-plus');
        const quantityInput = document.getElementById('product-quantity');
        const maxStock = this.product.stock;
        
        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                    this.quantity = value - 1;
                }
            });
            
            plusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value < maxStock) {
                    quantityInput.value = value + 1;
                    this.quantity = value + 1;
                }
            });
            
            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value);
                if (isNaN(value) || value < 1) value = 1;
                if (value > maxStock) value = maxStock;
                quantityInput.value = value;
                this.quantity = value;
            });
        }
    }
    
    initAddToCart() {
        const btn = document.getElementById('add-to-cart-detail');
        if (btn) {
            btn.addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
                
                store.addToCart({
                    id: this.product.id,
                    name: this.product.name,
                    price: this.product.price,
                    image: this.product.image,
                    concentration: this.product.concentration
                }, quantity);
                
                updateCartBadge();
                showNotification(`${this.product.name} agregado al carrito`, 'success');
                
                // Animación del botón
                btn.style.transform = 'scale(0.98)';
                setTimeout(() => btn.style.transform = '', 200);
            });
        }
    }
    
    destroy() {}
}