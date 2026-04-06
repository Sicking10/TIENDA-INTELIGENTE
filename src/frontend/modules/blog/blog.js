/**
 * Módulo Blog - GINGERcaps
 * Artículos desde API (MongoDB) con Cloudinary
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
        await this.loadPosts();
        this.renderContent();
        this.initFilters();
        this.initSearch();
        
        return this;
    }
    
    async loadPosts() {
        try {
            const response = await fetch('/api/blog');
            const data = await response.json();
            if (data.success) {
                this.posts = data.posts.filter(p => p.status === 'published');
                console.log('📸 Posts cargados:', this.posts.map(p => ({ title: p.title, imageUrl: p.imageUrl })));
            } else {
                this.posts = [];
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }
    
    renderContent() {
        const filteredPosts = this.currentCategory === 'all' 
            ? this.posts 
            : this.posts.filter(post => post.category === this.currentCategory);
        
        this.container.innerHTML = `
            <div class="blog-page">
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

                <section class="blog-grid-section">
                    <div class="container">
                        <div class="blog-grid" id="blog-grid">
                            <div class="loading-spinner"></div>
                        </div>
                        <div class="no-results" id="no-results" style="display: none;">
                            <i class="fas fa-search"></i>
                            <h3>No se encontraron artículos</h3>
                            <p>Intenta con otra categoría o término de búsqueda</p>
                        </div>
                    </div>
                </section>

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
        
        this.renderPostsGrid();
    }
    
    renderPostsGrid() {
        const grid = document.getElementById('blog-grid');
        if (!grid) return;
        
        const filteredPosts = this.currentCategory === 'all' 
            ? this.posts 
            : this.posts.filter(post => post.category === this.currentCategory);
        
        if (filteredPosts.length === 0) {
            grid.style.display = 'none';
            const noResults = document.getElementById('no-results');
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        const noResults = document.getElementById('no-results');
        if (noResults) noResults.style.display = 'none';
        
        // 🔥 IMAGEN CON CLOUDINARY
        grid.innerHTML = filteredPosts.map(post => `
            <article class="blog-card" data-id="${post._id}">
                <div class="blog-card-image">
                    ${post.imageUrl ? 
                        `<img src="${post.imageUrl}" alt="${this.escapeHtml(post.title)}" class="blog-card-img" onerror="this.src='/assets/images/blog/placeholder.jpg'">` :
                        `<div class="image-placeholder">
                            <i class="fas fa-leaf"></i>
                        </div>`
                    }
                    <span class="blog-category">${this.getCategoryIcon(post.category)} ${this.getCategoryName(post.category)}</span>
                </div>
                <div class="blog-card-content">
                    <div class="blog-meta">
                        <span class="blog-date">
                            <i class="far fa-calendar-alt"></i> ${new Date(post.createdAt).toLocaleDateString('es-MX')}
                        </span>
                    </div>
                    <h3>${this.escapeHtml(post.title)}</h3>
                    <p>${this.escapeHtml(post.excerpt)}</p>
                    <div class="blog-footer">
                        <div class="blog-author">
                            <div class="author-avatar">${post.authorAvatar || post.author?.charAt(0) || 'A'}</div>
                            <span>${this.escapeHtml(post.author || 'Administrador')}</span>
                        </div>
                        <button class="read-more" data-id="${post._id}">
                            Leer más <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
        
        this.reinitPostEvents();
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
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.renderPostsGrid();
            });
        });
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterAndRender();
            });
        }
        
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
        
        let filtered = this.currentCategory === 'all' 
            ? [...this.posts] 
            : this.posts.filter(post => post.category === this.currentCategory);
        
        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm) || 
                post.excerpt.toLowerCase().includes(searchTerm) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        const grid = document.getElementById('blog-grid');
        const noResults = document.getElementById('no-results');
        
        if (filtered.length === 0) {
            if (grid) grid.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
        } else {
            if (grid) grid.style.display = 'grid';
            if (noResults) noResults.style.display = 'none';
            if (grid) {
                // 🔥 IMAGEN CON CLOUDINARY también en búsqueda filtrada
                grid.innerHTML = filtered.map(post => `
                    <article class="blog-card" data-id="${post._id}">
                        <div class="blog-card-image">
                            ${post.imageUrl ? 
                                `<img src="${post.imageUrl}" alt="${this.escapeHtml(post.title)}" class="blog-card-img" onerror="this.src='/assets/images/blog/placeholder.jpg'">` :
                                `<div class="image-placeholder">
                                    <i class="fas fa-leaf"></i>
                                </div>`
                            }
                            <span class="blog-category">${this.getCategoryIcon(post.category)} ${this.getCategoryName(post.category)}</span>
                        </div>
                        <div class="blog-card-content">
                            <div class="blog-meta">
                                <span class="blog-date">
                                    <i class="far fa-calendar-alt"></i> ${new Date(post.createdAt).toLocaleDateString('es-MX')}
                                </span>
                                <span class="blog-read-time">
                                    <i class="far fa-clock"></i> ${post.readTime || 5} min
                                </span>
                            </div>
                            <h3>${this.escapeHtml(post.title)}</h3>
                            <p>${this.escapeHtml(post.excerpt)}</p>
                            <div class="blog-footer">
                                <div class="blog-author">
                                    <div class="author-avatar">${post.authorAvatar || post.author?.charAt(0) || 'A'}</div>
                                    <span>${this.escapeHtml(post.author || 'Administrador')}</span>
                                </div>
                                <button class="read-more" data-id="${post._id}">
                                    Leer más <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </article>
                `).join('');
                this.reinitPostEvents();
            }
        }
    }
    
    reinitPostEvents() {
        document.querySelectorAll('.read-more').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = btn.dataset.id;
                await this.showPostModal(postId);
            });
        });
    }
    
    async showPostModal(postId) {
        try {
            const response = await fetch(`/api/blog/${postId}`);
            const data = await response.json();
            
            if (!data.success || !data.post) {
                throw new Error('No se pudo cargar el artículo');
            }
            
            const post = data.post;
            
            const modal = document.createElement('div');
            modal.className = 'post-modal';
            modal.innerHTML = `
                <div class="post-modal-overlay"></div>
                <div class="post-modal-content">
                    <button class="post-modal-close">&times;</button>
                    <div class="post-modal-header">
                        <span class="post-category">${this.getCategoryIcon(post.category)} ${this.getCategoryName(post.category)}</span>
                        <h2>${this.escapeHtml(post.title)}</h2>
                        <div class="post-meta">
                            <div class="post-author">
                                <div class="author-avatar">${post.authorAvatar || post.author?.charAt(0) || 'A'}</div>
                                <span class="post-author-name">${this.escapeHtml(post.author || 'Administrador')}</span>
                            </div>
                            <div class="post-date">
                                <i class="far fa-calendar-alt"></i> ${new Date(post.createdAt).toLocaleDateString('es-MX')}
                            </div>
                            <div class="post-read-time">
                                <i class="far fa-clock"></i> ${post.readTime || 5} min
                            </div>
                        </div>
                    </div>
                    <div class="post-modal-body">
                        ${post.imageUrl ? 
                            `<div class="post-image">
                                <img src="${post.imageUrl}" alt="${this.escapeHtml(post.title)}" class="post-modal-img" onerror="this.src='/assets/images/blog/placeholder.jpg'">
                            </div>` :
                            `<div class="post-image-placeholder">
                                <i class="fas fa-leaf"></i>
                            </div>`
                        }
                        <div class="post-content">
                            ${post.content || '<p>Contenido no disponible.</p>'}
                        </div>
                    </div>
                    <div class="post-modal-footer">
                        <div class="post-tags">
                            ${post.tags ? post.tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('') : ''}
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
            
            const closeModal = () => modal.remove();
            modal.querySelector('.post-modal-close').addEventListener('click', closeModal);
            modal.querySelector('.post-modal-overlay').addEventListener('click', closeModal);
            
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
        } catch (error) {
            console.error('Error loading post:', error);
            const { showNotification } = await import('../notifications/notifications.js');
            showNotification('Error al cargar el artículo', 'error');
        }
    }
    
    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    destroy() {}
}