/**
 * Módulo Cart - Carrito de compras
 * Versión corregida - SIN onerror inline y rutas de imágenes fijas
 */

import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, updateCartBadge, calculateCartTotal } from '../../utils/cartUtils.js';

export default class CartView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.cartItems = [];
        this.cartTotal = 0;
        this.cartItemCount = 0;
        this.discount = 0;
        this.discountCode = '';
        this.shippingCost = 0;
    }
    
    async render() {
        this.loadCartData();
        
        if (this.cartItems.length === 0) {
            this.renderEmptyCart();
        } else {
            this.renderCartWithItems();
        }
        
        this.initEvents();
        this.setupImageErrorHandlers();
        
        return this;
    }
    
    loadCartData() {
        this.cartItems = store.get('cart.items') || [];
        this.cartTotal = store.get('cart.total') || 0;
        this.cartItemCount = store.get('cart.itemCount') || 0;
    }
    
    // Manejador de errores de imagen SIN inline
    setupImageErrorHandlers() {
        document.querySelectorAll('.cart-item-image img, .suggestion-image img').forEach(img => {
            img.removeEventListener('error', img._errorHandler);
            const handler = () => {
                img.src = '/assets/images/products/placeholder.jpg';
            };
            img._errorHandler = handler;
            img.addEventListener('error', handler);
        });
    }
    
    renderEmptyCart() {
        this.container.innerHTML = `
            <div class="cart-page">
                <div class="container">
                    <div class="cart-empty">
                        <div class="cart-empty-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <h2>Tu carrito está vacío</h2>
                        <p>Parece que aún no has agregado productos a tu carrito.</p>
                        <div class="cart-empty-actions">
                            <a href="/tienda" class="btn-add-cart" data-link>
                                <i class="fas fa-store"></i> Explorar productos
                            </a>
                            <a href="/beneficios" class="btn-add-cart" data-link>
                                <i class="fas fa-leaf"></i> Conocer beneficios
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCartWithItems() {
        const subtotal = this.cartTotal;
        const discountAmount = (subtotal * this.discount) / 100;
        const shipping = this.shippingCost;
        const total = subtotal - discountAmount + shipping;
        
        this.container.innerHTML = `
            <div class="cart-page">
                <div class="container">
                    <div class="cart-header">
                        <h1>Mi Carrito</h1>
                        <p class="cart-items-count">${this.cartItemCount} ${this.cartItemCount === 1 ? 'producto' : 'productos'}</p>
                    </div>
                    
                    <div class="cart-layout">
                        <!-- Lista de productos -->
                        <div class="cart-items">
                            <div class="cart-items-header">
                                <div class="col-product">Producto</div>
                                <div class="col-price">Precio</div>
                                <div class="col-quantity">Cantidad</div>
                                <div class="col-total">Subtotal</div>
                                <div class="col-actions"></div>
                            </div>
                            <div class="cart-items-list" id="cart-items-list">
                                ${this.renderCartItems()}
                            </div>
                            <div class="cart-actions">
                                <button class="btn-clear-cart" id="clear-cart-btn">
                                    <i class="fas fa-trash-alt"></i> Vaciar carrito
                                </button>
                                <a href="/tienda" class="btn-continue-shopping" data-link>
                                    <i class="fas fa-arrow-left"></i> Seguir comprando
                                </a>
                            </div>
                        </div>
                        
                        <!-- Resumen del pedido -->
                        <div class="cart-summary">
                            <h3>Resumen del pedido</h3>
                            
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span>${formatPrice(subtotal)}</span>
                            </div>
                            
                            <div class="summary-row discount-row" id="discount-row" style="${this.discount > 0 ? 'display: flex' : 'display: none'}">
                                <span>Descuento (${this.discount}%)</span>
                                <span class="discount-amount">-${formatPrice(discountAmount)}</span>
                            </div>
                            
                            <div class="summary-row">
                                <span>Envío</span>
                                <span class="shipping-cost" id="shipping-cost">
                                    ${shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                                </span>
                            </div>
                            
                            <div class="summary-divider"></div>
                            
                            <div class="summary-row total">
                                <span>Total</span>
                                <span class="total-amount">${formatPrice(total)}</span>
                            </div>
                            
                            <div class="coupon-section">
                                <div class="coupon-input-group">
                                    <input type="text" 
                                           id="coupon-code" 
                                           placeholder="Código de descuento"
                                           value="${this.discountCode}">
                                    <button id="apply-coupon-btn" class="btn-apply-coupon">
                                        Aplicar
                                    </button>
                                </div>
                                <div id="coupon-message" class="coupon-message"></div>
                            </div>
                            
                            <button id="checkout-btn" class="btn-checkout">
                                <i class="fas fa-lock"></i> Proceder al pago
                            </button>
                            
                            <div class="payment-methods">
                                <i class="fab fa-cc-visa"></i>
                                <i class="fab fa-cc-mastercard"></i>
                                <i class="fab fa-cc-amex"></i>
                                <i class="fab fa-paypal"></i>
                                <i class="fas fa-university"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCartItems() {
        return this.cartItems.map(item => {
            // Determinar qué imagen mostrar basado en el ID del producto
            let imageName = 'placeholder';
            if (item.id === 'ginger-origin' || item.name.includes('ORIGIN')) {
                imageName = 'original';
            } else if (item.id === 'ginger-elixir' || item.name.includes('ELIXIR')) {
                imageName = 'pro';
            } else if (item.image) {
                imageName = item.image;
            }
            
            return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-product">
                    <div class="cart-item-image">
                        <img src="/assets/images/products/${imageName}.jpg" 
                             alt="${item.name}"
                             class="cart-item-img"
                             loading="lazy">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-concentration">${item.concentration || ''}</span>
                    </div>
                </div>
                <div class="cart-item-price">
                    ${formatPrice(item.price)}
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-selector">
                        <button class="qty-btn minus" data-id="${item.id}" data-action="decrease">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               class="quantity-input" 
                               value="${item.quantity}" 
                               min="1" 
                               max="${item.maxStock || 99}"
                               data-id="${item.id}">
                        <button class="qty-btn plus" data-id="${item.id}" data-action="increase">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    ${formatPrice(item.price * item.quantity)}
                </div>
                <div class="cart-item-actions">
                    <button class="btn-remove-item" data-id="${item.id}" title="Eliminar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `}).join('');
    }
    
    initEvents() {
        // Eventos para modificar cantidad
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                const action = btn.dataset.action;
                const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
                if (!input) return;
                
                let currentValue = parseInt(input.value);
                
                if (action === 'increase') {
                    currentValue++;
                } else if (action === 'decrease') {
                    currentValue--;
                }
                
                if (currentValue >= 1 && currentValue <= 99) {
                    input.value = currentValue;
                    this.updateQuantity(productId, currentValue);
                }
            });
        });
        
        // Eventos para input de cantidad
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = input.dataset.id;
                let newValue = parseInt(input.value);
                if (isNaN(newValue) || newValue < 1) newValue = 1;
                if (newValue > 99) newValue = 99;
                input.value = newValue;
                this.updateQuantity(productId, newValue);
            });
        });
        
        // Eventos para eliminar item
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                this.removeItem(productId);
            });
        });
        
        // Vaciar carrito
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }
        
        // Aplicar cupón
        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => this.applyCoupon());
        }
        
        // Proceder al pago
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const isAuthenticated = store.get('auth.isAuthenticated');
                if (!isAuthenticated) {
                    showNotification('Debes iniciar sesión para continuar', 'warning');
                    sessionStorage.setItem('redirectAfterLogin', '/checkout');
                    window.location.href = '/login';
                } else {
                    window.location.href = '/checkout';
                }
            });
        }
        
        // Sugerencias (carrito vacío)
        document.querySelectorAll('.btn-add-suggestion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = JSON.parse(btn.dataset.product);
                store.addToCart({
                    id: product.id || Date.now(),
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    concentration: '500mg',
                    quantity: 1
                });
                showNotification(`${product.name} agregado al carrito`, 'success');
                updateCartBadge();
                this.render();
            });
        });
    }
    
    updateQuantity(productId, newQuantity) {
        store.updateCartItemQuantity(productId, newQuantity);
        updateCartBadge();
        this.render();
    }
    
    removeItem(productId) {
        store.removeFromCart(productId);
        updateCartBadge();
        this.render();
        
        if (this.cartItems.length === 1) {
            showNotification('Producto eliminado del carrito', 'info');
        }
    }
    
    clearCart() {
        if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
            store.clearCart();
            updateCartBadge();
            this.render();
            showNotification('Carrito vaciado', 'info');
        }
    }
    
    applyCoupon() {
        const couponInput = document.getElementById('coupon-code');
        const couponMessage = document.getElementById('coupon-message');
        const code = couponInput.value.trim().toUpperCase();
        
        // Cupones de ejemplo
        const coupons = {
            'BIENVENIDO10': { discount: 10, message: '¡Cupón aplicado! 10% de descuento' },
            'GINGER20': { discount: 20, message: '¡Cupón aplicado! 20% de descuento' },
            'ENVIOGRATIS': { discount: 0, freeShipping: true, message: '¡Envío gratis aplicado!' }
        };
        
        if (coupons[code]) {
            if (code === 'ENVIOGRATIS') {
                this.shippingCost = 0;
                this.discountCode = code;
                couponMessage.innerHTML = `<span class="success">${coupons[code].message}</span>`;
            } else {
                this.discount = coupons[code].discount;
                this.discountCode = code;
                couponMessage.innerHTML = `<span class="success">${coupons[code].message}</span>`;
            }
            this.render();
        } else if (code === '') {
            this.discount = 0;
            this.discountCode = '';
            this.shippingCost = 0;
            couponMessage.innerHTML = '';
            this.render();
        } else {
            couponMessage.innerHTML = '<span class="error">Cupón inválido o expirado</span>';
        }
    }
    
    destroy() {}
}