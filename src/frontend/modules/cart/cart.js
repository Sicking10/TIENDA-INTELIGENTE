/**
 * Módulo Cart - Carrito de compras
 */

export default class CartView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="cart-page">
                <div class="container">
                    <h1>Mi Carrito</h1>
                    <p>Próximamente: Carrito de compras</p>
                    <p style="margin-top: 1rem;">
                        <a href="/tienda" class="btn btn-primary" data-link>Seguir comprando</a>
                    </p>
                </div>
            </div>
        `;
        
        return this;
    }
    
    destroy() {}
}