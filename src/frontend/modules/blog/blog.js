/**
 * Módulo Blog - GINGERcaps
 * Artículos, consejos y bienestar natural
 */

export default class BlogView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.posts = [];
        this.categories = ['all', 'bienestar', 'recetas', 'rendimiento', 'ciencia', 'consejos'];
        this.currentCategory = 'all';
    }
    
    async render() {
        this.loadPosts();
        this.renderContent();
        this.initFilters();
        this.initSearch();
        
        return this;
    }
    
    loadPosts() {
        this.posts = [
            {
                id: 1,
                title: '10 beneficios del jengibre que no conocías',
                excerpt: 'Descubre cómo este superalimento puede transformar tu salud y bienestar de maneras que nunca imaginaste.',
                content: 'El jengibre ha sido utilizado durante miles de años en la medicina tradicional...',
                category: 'bienestar',
                image: 'ginger-benefits',
                author: 'Dra. María González',
                authorAvatar: 'MG',
                date: '15 Marzo, 2024',
                readTime: '5 min',
                tags: ['jengibre', 'bienestar', 'salud natural']
            },
            {
                id: 2,
                title: 'Recetas saludables con jengibre para tu día a día',
                excerpt: 'Incorporá el jengibre a tus comidas diarias de forma deliciosa y sencilla con estas recetas.',
                content: 'El jengibre no solo es beneficioso para la salud, sino que también añade un sabor único...',
                category: 'recetas',
                image: 'ginger-recipes',
                author: 'Chef Carlos Ruiz',
                authorAvatar: 'CR',
                date: '10 Marzo, 2024',
                readTime: '8 min',
                tags: ['recetas', 'jengibre', 'cocina saludable']
            },
            {
                id: 3,
                title: 'Cómo el jengibre mejora tu rendimiento físico',
                excerpt: 'Estudios muestran que el jengibre puede mejorar el rendimiento deportivo y la recuperación muscular.',
                content: 'Los atletas de alto rendimiento están incorporando el jengibre en su rutina diaria...',
                category: 'rendimiento',
                image: 'ginger-performance',
                author: 'Dr. Roberto Méndez',
                authorAvatar: 'RM',
                date: '5 Marzo, 2024',
                readTime: '6 min',
                tags: ['deporte', 'rendimiento', 'recuperación']
            },
            {
                id: 4,
                title: 'Jengibre vs Cúrcuma: ¿cuál es mejor para ti?',
                excerpt: 'Ambos superalimentos tienen propiedades únicas. Te explicamos cuál elegir según tus necesidades.',
                content: 'El jengibre y la cúrcuma son dos de los ingredientes más poderosos de la naturaleza...',
                category: 'ciencia',
                image: 'ginger-turmeric',
                author: 'Dra. Laura Fernández',
                authorAvatar: 'LF',
                date: '28 Febrero, 2024',
                readTime: '7 min',
                tags: ['jengibre', 'cúrcuma', 'comparativa']
            },
            {
                id: 5,
                title: 'Manzanilla: el secreto para un sueño reparador',
                excerpt: 'Descubre cómo la manzanilla puede ayudarte a mejorar la calidad de tu sueño y reducir el estrés.',
                content: 'La manzanilla ha sido utilizada durante siglos como un remedio natural para la ansiedad...',
                category: 'bienestar',
                image: 'chamomile-sleep',
                author: 'Dra. María González',
                authorAvatar: 'MG',
                date: '20 Febrero, 2024',
                readTime: '4 min',
                tags: ['manzanilla', 'sueño', 'relajación']
            },
            {
                id: 6,
                title: 'Cómo tomar GINGERcaps: guía completa',
                excerpt: 'Te explicamos la mejor forma de incorporar nuestras cápsulas en tu rutina diaria.',
                content: 'Para obtener los máximos beneficios de GINGERcaps, es importante saber cuándo y cómo tomarlas...',
                category: 'consejos',
                image: 'gingercaps-guide',
                author: 'Equipo GINGER',
                authorAvatar: 'GG',
                date: '15 Febrero, 2024',
                readTime: '5 min',
                tags: ['gingercaps', 'guía', 'consejos']
            },
            {
                id: 7,
                title: 'Los mitos y verdades sobre el jengibre',
                excerpt: 'Separamos la realidad de la ficción sobre uno de los superalimentos más populares.',
                content: 'Existen muchas creencias alrededor del jengibre. Te contamos qué es verdad y qué no...',
                category: 'ciencia',
                image: 'ginger-myths',
                author: 'Dr. Roberto Méndez',
                authorAvatar: 'RM',
                date: '10 Febrero, 2024',
                readTime: '6 min',
                tags: ['jengibre', 'mitos', 'ciencia']
            },
            {
                id: 8,
                title: 'Bebidas calientes con jengibre para el invierno',
                excerpt: 'Prepara deliciosas y saludables bebidas para combatir el frío y fortalecer tus defensas.',
                content: 'El jengibre es el ingrediente perfecto para crear bebidas calientes que te reconforten...',
                category: 'recetas',
                image: 'ginger-drinks',
                author: 'Chef Carlos Ruiz',
                authorAvatar: 'CR',
                date: '5 Febrero, 2024',
                readTime: '7 min',
                tags: ['bebidas', 'invierno', 'recetas']
            },
            {
                id: 9,
                title: 'Beneficios del jengibre para la piel',
                excerpt: 'Descubre cómo el jengibre puede ayudarte a tener una piel más saludable y radiante.',
                content: 'Las propiedades antioxidantes del jengibre lo convierten en un aliado perfecto para el cuidado de la piel...',
                category: 'bienestar',
                image: 'ginger-skin',
                author: 'Dra. Laura Fernández',
                authorAvatar: 'LF',
                date: '28 Enero, 2024',
                readTime: '5 min',
                tags: ['piel', 'belleza', 'jengibre']
            }
        ];
    }
    
    renderContent() {
        const filteredPosts = this.currentCategory === 'all' 
            ? this.posts 
            : this.posts.filter(post => post.category === this.currentCategory);
        
        this.container.innerHTML = `
            <div class="blog-page">
                <!-- Hero -->
                <section class="blog-hero">
                    <div class="blog-hero-bg">
                        <div class="hero-glow hero-glow-1"></div>
                        <div class="hero-glow hero-glow-2"></div>
                    </div>
                    <div class="container">
                        <div class="blog-hero-content">
                            <div class="hero-chip">
                                <span>📖 Blog</span>
                            </div>
                            <h1>Inspiración para tu <span class="gradient-word">bienestar</span></h1>
                            <p>Consejos, recetas y todo sobre el poder de la naturaleza para transformar tu vida</p>
                            <div class="hero-stats">
                                <div class="stat">
                                    <div class="stat-number">${this.posts.length}+</div>
                                    <div class="stat-label">Artículos</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-number">15k+</div>
                                    <div class="stat-label">Lectores</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-number">4.9★</div>
                                    <div class="stat-label">Valoración</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Buscador y filtros -->
                <section class="blog-filters">
                    <div class="container">
                        <div class="filters-wrapper">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="blog-search" placeholder="Buscar artículos...">
                            </div>
                            <div class="categories-filter">
                                <button class="filter-btn active" data-category="all">Todos</button>
                                <button class="filter-btn" data-category="bienestar">Bienestar</button>
                                <button class="filter-btn" data-category="recetas">Recetas</button>
                                <button class="filter-btn" data-category="rendimiento">Rendimiento</button>
                                <button class="filter-btn" data-category="ciencia">Ciencia</button>
                                <button class="filter-btn" data-category="consejos">Consejos</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Grid de artículos -->
                <section class="blog-grid-section">
                    <div class="container">
                        <div class="blog-grid" id="blog-grid">
                            ${this.renderPosts(filteredPosts)}
                        </div>
                        <div class="load-more" id="load-more" style="display: none;">
                            <button class="btn-load-more">Cargar más artículos</button>
                        </div>
                        <div class="no-results" id="no-results" style="display: none;">
                            <i class="fas fa-search"></i>
                            <h3>No se encontraron artículos</h3>
                            <p>Intenta con otra categoría o término de búsqueda</p>
                        </div>
                    </div>
                </section>

                <!-- Newsletter -->
                <section class="newsletter-section">
                    <div class="container">
                        <div class="newsletter-card">
                            <div class="newsletter-icon">📧</div>
                            <h2>Suscríbete a nuestro <span>blog</span></h2>
                            <p>Recibe los mejores consejos y recetas directamente en tu correo</p>
                            <form id="newsletter-form" class="newsletter-form">
                                <input type="email" placeholder="Tu correo electrónico" required>
                                <button type="submit">Suscribirme</button>
                            </form>
                            <p class="newsletter-note">No spam, solo contenido de valor. Puedes cancelar cuando quieras.</p>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }
    
    renderPosts(posts) {
        if (posts.length === 0) {
            return '';
        }
        
        return posts.map(post => `
            <article class="blog-card" data-id="${post.id}">
                <div class="blog-card-image">
                    <div class="image-placeholder">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <span class="blog-category">${this.getCategoryIcon(post.category)} ${this.getCategoryName(post.category)}</span>
                </div>
                <div class="blog-card-content">
                    <div class="blog-meta">
                        <span class="blog-date">
                            <i class="far fa-calendar-alt"></i> ${post.date}
                        </span>
                        <span class="blog-read-time">
                            <i class="far fa-clock"></i> ${post.readTime}
                        </span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <div class="blog-footer">
                        <div class="blog-author">
                            <div class="author-avatar">${post.authorAvatar}</div>
                            <span>${post.author}</span>
                        </div>
                        <button class="read-more" data-id="${post.id}">
                            Leer más <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
    }
    
    getCategoryIcon(category) {
        const icons = {
            'bienestar': '🌿',
            'recetas': '🍳',
            'rendimiento': '⚡',
            'ciencia': '🔬',
            'consejos': '💡'
        };
        return icons[category] || '📖';
    }
    
    getCategoryName(category) {
        const names = {
            'bienestar': 'Bienestar',
            'recetas': 'Recetas',
            'rendimiento': 'Rendimiento',
            'ciencia': 'Ciencia',
            'consejos': 'Consejos'
        };
        return names[category] || category;
    }
    
    initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('blog-search');
        const grid = document.getElementById('blog-grid');
        const noResults = document.getElementById('no-results');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.filterAndRender();
            });
        });
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterAndRender();
            });
        }
        
        // Eventos para leer más
        document.querySelectorAll('.read-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(btn.dataset.id);
                this.showPostModal(postId);
            });
        });
        
        // Newsletter
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input').value;
                alert(`¡Gracias por suscribirte, ${email}! Recibirás nuestras novedades.`);
                newsletterForm.reset();
            });
        }
    }
    
    initSearch() {
        // Ya implementado en initFilters
    }
    
    filterAndRender() {
        const searchTerm = document.getElementById('blog-search')?.value.toLowerCase() || '';
        const grid = document.getElementById('blog-grid');
        const noResults = document.getElementById('no-results');
        
        let filtered = this.currentCategory === 'all' 
            ? [...this.posts] 
            : this.posts.filter(post => post.category === this.currentCategory);
        
        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm) || 
                post.excerpt.toLowerCase().includes(searchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        if (filtered.length === 0) {
            grid.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            grid.style.display = 'grid';
            noResults.style.display = 'none';
            grid.innerHTML = this.renderPosts(filtered);
            this.reinitPostEvents();
        }
    }
    
    reinitPostEvents() {
        document.querySelectorAll('.read-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(btn.dataset.id);
                this.showPostModal(postId);
            });
        });
    }
    
    showPostModal(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="post-modal-overlay"></div>
            <div class="post-modal-content">
                <button class="post-modal-close">&times;</button>
                <div class="post-modal-header">
                    <span class="post-category">${this.getCategoryIcon(post.category)} ${this.getCategoryName(post.category)}</span>
                    <h2>${post.title}</h2>
                    <div class="post-meta">
                        <div class="post-author">
                            <div class="author-avatar">${post.authorAvatar}</div>
                            <span>${post.author}</span>
                        </div>
                        <div class="post-date">
                            <i class="far fa-calendar-alt"></i> ${post.date}
                        </div>
                        <div class="post-read-time">
                            <i class="far fa-clock"></i> ${post.readTime}
                        </div>
                    </div>
                </div>
                <div class="post-modal-body">
                    <div class="post-image-placeholder">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <div class="post-content">
                        <p>${post.content}</p>
                        <p>El jengibre es una planta con propiedades medicinales extraordinarias. Su compuesto activo, el gingerol, es responsable de sus potentes efectos antiinflamatorios y antioxidantes.</p>
                        <p>Estudios recientes han demostrado que el consumo regular de jengibre puede ayudar a reducir el dolor muscular, mejorar la digestión, fortalecer el sistema inmunológico y reducir la inflamación crónica.</p>
                        <h3>Beneficios clave</h3>
                        <ul>
                            <li>Antiinflamatorio natural</li>
                            <li>Mejora la digestión</li>
                            <li>Fortalece el sistema inmune</li>
                            <li>Aumenta la energía</li>
                        </ul>
                        <p>Incorporar GINGERcaps a tu rutina diaria es la forma más sencilla de aprovechar todos estos beneficios en una sola cápsula.</p>
                    </div>
                </div>
                <div class="post-modal-footer">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="post-share">
                        <span>Compartir:</span>
                        <button class="share-btn" data-platform="facebook"><i class="fab fa-facebook-f"></i></button>
                        <button class="share-btn" data-platform="twitter"><i class="fab fa-twitter"></i></button>
                        <button class="share-btn" data-platform="whatsapp"><i class="fab fa-whatsapp"></i></button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.post-modal-close');
        const overlay = modal.querySelector('.post-modal-overlay');
        
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Compartir
        modal.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(post.title);
                let shareUrl = '';
                
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${title}%20${url}`;
                        break;
                }
                
                if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.contains(modal)) {
                modal.remove();
            }
        });
    }
    
    destroy() {}
}