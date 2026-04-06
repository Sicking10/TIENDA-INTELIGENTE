/**
 * Admin Blog - Gestión de artículos con API y subida de imágenes
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';

export default class AdminBlogView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.posts = [];
        this.categories = ['bienestar', 'recetas', 'rendimiento', 'ciencia', 'consejos'];
    }

    async render() {
        if (!authGuard.isAuthenticated() || !authGuard.hasRole('admin')) {
            window.location.href = '/';
            return;
        }

        await this.loadPosts();

        this.container.innerHTML = `
            <div class="admin-page">
                <div class="admin-container">
                    <div class="admin-header">
                        <div>
                            <h1><i class="fas fa-newspaper"></i> Gestionar Blog</h1>
                            <p>Administra los artículos del blog</p>
                        </div>
                        <button class="btn-primary" id="add-post-btn">
                            <i class="fas fa-plus"></i> Nuevo Artículo
                        </button>
                    </div>

                    <div class="admin-layout">
                        <aside class="admin-sidebar">
                            <nav class="admin-nav">
                                <a href="/admin" class="admin-nav-item" data-link>
                                    <i class="fas fa-chart-line"></i> Dashboard
                                </a>
                                <a href="/admin/productos" class="admin-nav-item" data-link>
                                    <i class="fas fa-box"></i> Productos
                                </a>
                                <a href="/admin/blog" class="admin-nav-item active" data-link>
                                    <i class="fas fa-newspaper"></i> Blog
                                </a>
                                <a href="/admin/usuarios" class="admin-nav-item" data-link>
                                    <i class="fas fa-users"></i> Usuarios
                                </a>
                                <a href="/admin/pedidos" class="admin-nav-item" data-link>
                                    <i class="fas fa-shopping-cart"></i> Pedidos
                                </a>
                            </nav>
                        </aside>

                        <main class="admin-main">
                            <div class="posts-list">
                                ${this.renderPostsTable()}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;

        this.initEvents();

        return this;
    }

    async loadPosts() {
        try {
            const token = store.get('auth.token');
            const response = await fetch('/api/admin/blog', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                this.posts = data.posts;
            } else {
                this.posts = [];
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    renderPostsTable() {
        if (this.posts.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No hay artículos</h3>
                    <p>Agrega tu primer artículo usando el botón "Nuevo Artículo"</p>
                </div>
            `;
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Título</th>
                        <th>Categoría</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.posts.map(post => `
                        <tr data-post-id="${post._id}">
                            <td>
                                <img src="/assets/images/blog/${post.image || 'placeholder.jpg'}" 
                                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">
                            </td>
                            <td><strong>${this.escapeHtml(post.title)}</strong></td>
                            <td>${this.getCategoryIcon(post.category)} ${this.getCategoryName(post.category)}</td>
                            <td>${new Date(post.createdAt).toLocaleDateString('es-MX')}</td>
                            <td>
                                <span class="status-badge ${post.status === 'published' ? 'active' : 'inactive'}">
                                    ${post.status === 'published' ? 'Publicado' : 'Borrador'}
                                </span>
                            </td>
                            <td>
                                <button class="action-btn edit" data-id="${post._id}" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-id="${post._id}" title="Eliminar">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
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

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'blog');
        
        const token = store.get('auth.token');
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }

    initEvents() {
    const addBtn = document.getElementById('add-post-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.showPostModal());
    
    const emptyAddBtn = document.getElementById('empty-add-post-btn');
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => this.showPostModal());

    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const post = this.posts.find(p => p._id === id);
            if (post) this.showPostModal(post);
        });
    });

    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const post = this.posts.find(p => p._id === id);
            
            // 🔥 MODAL PERSONALIZADO en lugar de confirm()
            const { showConfirmModal } = await import('../../../utils/confirmModal.js');
            const confirmed = await showConfirmModal({
                title: 'Eliminar artículo del blog',
                message: `¿Estás seguro de que deseas eliminar el artículo "${post.title}"? Esta acción no se puede deshacer.`,
                confirmText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                type: 'danger'
            });

            if (!confirmed) return;

            // Mostrar loading en el botón
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const token = store.get('auth.token');
                const response = await fetch(`/api/admin/blog/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    await this.loadPosts();
                    this.render();
                    showNotification('Artículo eliminado correctamente', 'success');
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Error al eliminar');
                }
            } catch (error) {
                showNotification(error.message, 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    });
}

    showPostModal(post = null) {
    const isEditing = !!post;
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-overlay" data-no-router></div>
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h3>${isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
                <button class="modal-close" data-no-router>&times;</button>
            </div>
            <div class="modal-body">
                <form id="post-form">
                    <div class="form-group">
                        <label>Imagen destacada</label>
                        <div class="image-upload-area" style="border: 2px dashed rgba(200,101,27,0.2); border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s;">
                            <input type="file" id="post-image-input" accept="image/jpeg,image/png,image/webp" style="display: none;">
                            <div id="image-preview" style="margin-bottom: 12px;">
                                ${post?.image ? `<img src="/assets/images/blog/${post.image}" style="max-width: 100px; max-height: 100px; border-radius: 12px;">` : '<i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: var(--ginger);"></i>'}
                            </div>
                            <p class="image-preview-text">${post?.image ? 'Click para cambiar imagen' : 'Haz clic para seleccionar una imagen'}</p>
                            <small style="color: var(--gray-500);">Formatos: JPG, PNG, WEBP (máx. 2MB)</small>
                        </div>
                        <input type="hidden" id="post-image-name" value="${post?.image || ''}">
                    </div>
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" id="post-title" value="${isEditing ? this.escapeHtml(post.title) : ''}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="post-category" required>
                                <option value="bienestar" ${isEditing && post.category === 'bienestar' ? 'selected' : ''}>🌿 Bienestar</option>
                                <option value="recetas" ${isEditing && post.category === 'recetas' ? 'selected' : ''}>🍳 Recetas</option>
                                <option value="rendimiento" ${isEditing && post.category === 'rendimiento' ? 'selected' : ''}>⚡ Rendimiento</option>
                                <option value="ciencia" ${isEditing && post.category === 'ciencia' ? 'selected' : ''}>🔬 Ciencia</option>
                                <option value="consejos" ${isEditing && post.category === 'consejos' ? 'selected' : ''}>💡 Consejos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado</label>
                            <select id="post-status">
                                <option value="draft" ${isEditing && post.status === 'draft' ? 'selected' : ''}>Borrador</option>
                                <option value="published" ${isEditing && post.status === 'published' ? 'selected' : ''}>Publicar</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Resumen / Extracto *</label>
                        <textarea id="post-excerpt" rows="3" required>${isEditing ? this.escapeHtml(post.excerpt) : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Contenido completo</label>
                        <textarea id="post-content" rows="8">${isEditing ? this.escapeHtml(post.content || '') : ''}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Autor</label>
                            <input type="text" id="post-author" value="${isEditing ? this.escapeHtml(post.author || 'Administrador') : 'Administrador'}">
                        </div>
                        <div class="form-group">
                            <label>Tags (separados por coma)</label>
                            <input type="text" id="post-tags" value="${isEditing ? (post.tags || []).join(', ') : ''}" placeholder="jengibre, bienestar, salud">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-save" data-no-router>${isEditing ? 'Actualizar' : 'Publicar'} Artículo</button>
                        <button type="button" class="btn-cancel" data-no-router>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // Configurar selector de imagen
    const uploadArea = modal.querySelector('.image-upload-area');
    const fileInput = modal.querySelector('#post-image-input');
    const imagePreview = modal.querySelector('#image-preview');
    const imageNameInput = modal.querySelector('#post-image-name');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.innerHTML = `<img src="${event.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 12px;">`;
            };
            reader.readAsDataURL(file);
            
            try {
                const result = await this.uploadImage(file);
                imageNameInput.value = result.filename;
                showNotification('Imagen subida correctamente', 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };

    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const cancelBtn = modal.querySelector('.btn-cancel');
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    const form = modal.querySelector('#post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const tagsStr = document.getElementById('post-tags').value;
            const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
            const imageName = document.getElementById('post-image-name').value;

            const postData = {
                title: document.getElementById('post-title').value,
                excerpt: document.getElementById('post-excerpt').value,
                content: document.getElementById('post-content').value,
                category: document.getElementById('post-category').value,
                status: document.getElementById('post-status').value,
                author: document.getElementById('post-author').value || 'Administrador',
                authorAvatar: (document.getElementById('post-author').value || 'AD').substring(0, 2).toUpperCase(),
                tags: tags,
                image: imageName || (isEditing ? post.image : 'placeholder.jpg'),
                readTime: Math.ceil(document.getElementById('post-content').value.split(' ').length / 200) || 5
            };

            const submitBtn = form.querySelector('.btn-save');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                const token = store.get('auth.token');
                let url = '/api/admin/blog';
                let method = 'POST';
                
                if (isEditing) {
                    url = `/api/admin/blog/${post._id}`;
                    method = 'PUT';
                }
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(postData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    await this.loadPosts();
                    this.render();
                    closeModal();
                    showNotification(isEditing ? 'Artículo actualizado' : 'Artículo creado', 'success');
                } else {
                    throw new Error(data.message || 'Error al guardar');
                }
            } catch (error) {
                showNotification(error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
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