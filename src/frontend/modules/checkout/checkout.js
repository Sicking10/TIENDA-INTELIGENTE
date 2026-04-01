/**
 * Módulo Checkout - Finalizar compra
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice, getCartItemCount, calculateCartTotal } from '../../utils/cartUtils.js';

export default class CheckoutView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.cart = store.get('cart');
    }
    
    async render() {
        // Verificar autenticación
        if (!authGuard.isAuthenticated()) {
            window.location.href = '/login?redirect=/checkout';
            return;
        }
        
        // Verificar que el carrito no esté vacío
        if (getCartItemCount() === 0) {
            window.location.href = '/carrito';
            showNotification('Tu carrito está vacío', 'warning');
            return;
        }
        
        this.container.innerHTML = `
            <div class="checkout-page">
                <div class="container">
                    <div class="checkout-header">
                        <h1>Finalizar compra</h1>
                        <p>Completa tus datos para recibir tu pedido</p>
                    </div>
                    
                    <div class="checkout-grid">
                        <!-- Formulario de checkout -->
                        <div class="checkout-form">
                            <div class="form-section">
                                <h3>Información de contacto</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Nombre completo</label>
                                        <input type="text" id="full-name" placeholder="Juan Pérez" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" id="email" placeholder="juan@email.com" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Teléfono</label>
                                    <input type="tel" id="phone" placeholder="+52 123 456 7890" required>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>Dirección de envío</h3>
                                <div class="form-group">
                                    <label>Calle y número</label>
                                    <input type="text" id="address" placeholder="Calle 123, Colonia" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Ciudad</label>
                                        <input type="text" id="city" placeholder="Ciudad" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Código Postal</label>
                                        <input type="text" id="zip" placeholder="CP" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Estado</label>
                                        <input type="text" id="state" placeholder="Estado" required>
                                    </div>
                                    <div class="form-group">
                                        <label>País</label>
                                        <input type="text" id="country" value="México" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>Método de pago</h3>
                                <div class="payment-methods">
                                    <label class="payment-option">
                                        <input type="radio" name="payment" value="card" checked>
                                        <i class="fas fa-credit-card"></i>
                                        <span>Tarjeta de crédito/débito</span>
                                    </label>
                                    <label class="payment-option">
                                        <input type="radio" name="payment" value="paypal">
                                        <i class="fab fa-paypal"></i>
                                        <span>PayPal</span>
                                    </label>
                                    <label class="payment-option">
                                        <input type="radio" name="payment" value="transfer">
                                        <i class="fas fa-university"></i>
                                        <span>Transferencia bancaria</span>
                                    </label>
                                </div>
                                
                                <div id="card-details" class="card-details">
                                    <div class="form-group">
                                        <label>Número de tarjeta</label>
                                        <input type="text" placeholder="**** **** **** ****">
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Fecha expiración</label>
                                            <input type="text" placeholder="MM/AA">
                                        </div>
                                        <div class="form-group">
                                            <label>CVV</label>
                                            <input type="text" placeholder="123">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button id="place-order-btn" class="btn-place-order">
                                <i class="fas fa-check"></i> Confirmar pedido
                            </button>
                        </div>
                        
                        <!-- Resumen del pedido -->
                        <div class="order-summary">
                            <h3>Resumen del pedido</h3>
                            <div class="summary-items" id="summary-items">
                                ${this.renderSummaryItems()}
                            </div>
                            <div class="summary-totals">
                                <div class="summary-row">
                                    <span>Subtotal</span>
                                    <span>${formatPrice(calculateCartTotal())}</span>
                                </div>
                                <div class="summary-row">
                                    <span>Envío</span>
                                    <span>${formatPrice(0)}</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total</span>
                                    <span>${formatPrice(calculateCartTotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initPaymentMethod();
        this.initPlaceOrder();
        
        return this;
    }
    
    renderSummaryItems() {
        const items = store.get('cart.items') || [];
        if (items.length === 0) return '<p>No hay productos</p>';
        
        return items.map(item => `
            <div class="summary-item">
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                </div>
                <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }
    
    initPaymentMethod() {
        const paymentOptions = document.querySelectorAll('input[name="payment"]');
        const cardDetails = document.getElementById('card-details');
        
        paymentOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                if (e.target.value === 'card') {
                    cardDetails.style.display = 'block';
                } else {
                    cardDetails.style.display = 'none';
                }
            });
        });
    }
    
    initPlaceOrder() {
        const btn = document.getElementById('place-order-btn');
        if (btn) {
            btn.addEventListener('click', async () => {
                await this.placeOrder();
            });
        }
    }
    
    async placeOrder() {
        const fullName = document.getElementById('full-name')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const address = document.getElementById('address')?.value;
        const city = document.getElementById('city')?.value;
        const zip = document.getElementById('zip')?.value;
        
        if (!fullName || !email || !address || !city || !zip) {
            showNotification('Por favor completa todos los campos', 'error');
            return;
        }
        
        const btn = document.getElementById('place-order-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btn.disabled = true;
        
        try {
            const items = store.get('cart.items');
            const total = calculateCartTotal();
            
            const orderData = {
                customer: { name: fullName, email, phone },
                shipping: { address, city, zip, country: 'México' },
                items: items,
                total: total,
                date: new Date().toISOString()
            };
            
            const token = store.get('auth.token');
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error('Error al procesar el pedido');
            }
            
            const data = await response.json();
            
            // Limpiar carrito
            store.clearCart();
            
            showNotification('¡Pedido realizado con éxito!', 'success');
            
            // Redirigir a seguimiento del pedido
            setTimeout(() => {
                window.location.href = `/pedido/${data.orderId}`;
            }, 1500);
            
        } catch (error) {
            console.error('Error placing order:', error);
            showNotification(error.message || 'Error al procesar el pedido', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    destroy() {}
}