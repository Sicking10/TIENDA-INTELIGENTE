/**
 * Módulo Detalle de Producto
 */

import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, updateCartBadge } from '../../utils/cartUtils.js';

export default class ProductDetailView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.productId = params.id;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="product-detail-page">
                <div class="container">
                    <div class="product-detail-grid">
                        <div class="product-gallery">
                            <div class="main-image">
                                <i class="fas fa-capsules"></i>
                            </div>
                            <div class="thumbnail-list">
                                <div class="thumbnail active"><i class="fas fa-capsules"></i></div>
                                <div class="thumbnail"><i class="fas fa-leaf"></i></div>
                                <div class="thumbnail"><i class="fas fa-flask"></i></div>
                            </div>
                        </div>
                        
                        <div class="product-info-detail">
                            <div class="product-badge">⭐ Más vendido</div>
                            <h1>GINGERcaps Original</h1>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                                <span>(128 reseñas)</span>
                            </div>
                            <div class="product-price-detail">
                                <span class="current">${formatPrice(349)}</span>
                                <span class="old">${formatPrice(499)}</span>
                                <span class="discount">-30%</span>
                            </div>
                            <p class="product-description">
                                GINGERcaps Original es la forma más pura de obtener los beneficios del jengibre. 
                                Cada cápsula contiene 500mg de extracto de jengibre estandarizado al 5% de gingerol, 
                                el compuesto activo responsable de sus propiedades antiinflamatorias y antioxidantes.
                            </p>
                            
                            <div class="product-benefits">
                                <h3>Beneficios:</h3>
                                <ul>
                                    <li><i class="fas fa-check"></i> Antiinflamatorio natural</li>
                                    <li><i class="fas fa-check"></i> Mejora la digestión</li>
                                    <li><i class="fas fa-check"></i> Fortalece el sistema inmune</li>
                                    <li><i class="fas fa-check"></i> Aumenta la energía</li>
                                </ul>
                            </div>
                            
                            <div class="product-actions">
                                <div class="quantity-selector">
                                    <button class="qty-btn minus">-</button>
                                    <input type="number" value="1" min="1" max="10" id="product-quantity">
                                    <button class="qty-btn plus">+</button>
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
        
        this.initQuantitySelector();
        this.initAddToCart();
        
        return this;
    }
    
    initQuantitySelector() {
        const minusBtn = document.querySelector('.qty-btn.minus');
        const plusBtn = document.querySelector('.qty-btn.plus');
        const quantityInput = document.getElementById('product-quantity');
        
        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                }
            });
            
            plusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value < 10) {
                    quantityInput.value = value + 1;
                }
            });
            
            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value);
                if (isNaN(value) || value < 1) quantityInput.value = 1;
                if (value > 10) quantityInput.value = 10;
            });
        }
    }
    
    initAddToCart() {
        const btn = document.getElementById('add-to-cart-detail');
        if (btn) {
            btn.addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
                
                store.addToCart({
                    id: Date.now(),
                    name: 'GINGERcaps Original',
                    price: 349,
                    image: 'capsules'
                }, quantity);
                
                updateCartBadge();
                showNotification('GINGERcaps Original agregado al carrito', 'success');
            });
        }
    }
    
    destroy() {}
}