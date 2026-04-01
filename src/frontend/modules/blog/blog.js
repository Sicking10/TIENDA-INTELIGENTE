/**
 * Módulo Blog
 */

export default class BlogView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="blog-page">
                <div class="blog-hero">
                    <div class="container">
                        <h1>Blog GINGER</h1>
                        <p>Consejos, recetas y todo sobre el bienestar natural</p>
                    </div>
                </div>
                
                <div class="container">
                    <div class="blog-grid">
                        <div class="blog-card">
                            <div class="blog-image"><i class="fas fa-leaf"></i></div>
                            <div class="blog-content">
                                <span class="blog-category">Bienestar</span>
                                <h3>10 beneficios del jengibre que no conocías</h3>
                                <p>Descubre cómo este superalimento puede transformar tu salud...</p>
                                <a href="#" class="read-more">Leer más →</a>
                            </div>
                        </div>
                        
                        <div class="blog-card">
                            <div class="blog-image"><i class="fas fa-utensils"></i></div>
                            <div class="blog-content">
                                <span class="blog-category">Recetas</span>
                                <h3>Recetas saludables con jengibre</h3>
                                <p>Incorporá el jengibre a tus comidas diarias de forma deliciosa...</p>
                                <a href="#" class="read-more">Leer más →</a>
                            </div>
                        </div>
                        
                        <div class="blog-card">
                            <div class="blog-image"><i class="fas fa-dumbbell"></i></div>
                            <div class="blog-content">
                                <span class="blog-category">Rendimiento</span>
                                <h3>Cómo el jengibre mejora tu rendimiento físico</h3>
                                <p>Estudios muestran que el jengibre puede mejorar el rendimiento deportivo...</p>
                                <a href="#" class="read-more">Leer más →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return this;
    }
    
    destroy() {}
}