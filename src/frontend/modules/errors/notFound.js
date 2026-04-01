/**
 * Módulo 404 - Página no encontrada
 */

export default class NotFoundView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="error-page not-found-page">
                <div class="error-container">
                    <div class="error-code">404</div>
                    <h1>Página no encontrada</h1>
                    <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
                    <div class="error-actions">
                        <a href="/" class="btn btn-primary" data-link>
                            <i class="fas fa-home"></i> Volver al inicio
                        </a>
                        <a href="/tienda" class="btn btn-outline" data-link>
                            <i class="fas fa-store"></i> Ir a la tienda
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        return this;
    }
    
    destroy() {}
}