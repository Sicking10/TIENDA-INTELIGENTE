/**
 * Utilidades para el carrito de compras
 */

import { store } from '../store.js';

/**
 * Actualiza el badge del carrito en la navbar
 */
export const updateCartBadge = () => {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const itemCount = store.get('cart.itemCount') || 0;
    badge.textContent = itemCount;
    badge.style.display = itemCount > 0 ? 'flex' : 'flex'; // siempre visible pero con 0
    if (itemCount === 0) {
        badge.textContent = '0';
    }
};

/**
 * Calcula el total del carrito
 */
export function calculateCartTotal() {
    const items = store.get('cart.items') || [];
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Obtiene el número de items en el carrito
 */
export function getCartItemCount() {
    const items = store.get('cart.items') || [];
    return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Verifica si el carrito tiene items
 */
export function hasCartItems() {
    return getCartItemCount() > 0;
}

/**
 * Formatea el precio en moneda local
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
    }).format(price);
}

export default {
    updateCartBadge,
    calculateCartTotal,
    getCartItemCount,
    hasCartItems,
    formatPrice
};