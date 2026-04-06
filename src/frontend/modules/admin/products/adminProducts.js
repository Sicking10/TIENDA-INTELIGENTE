/**
 * Admin Products - Gestión de productos con API
 * + RESPONSIVE: tabla con scroll horizontal, modal bottom-sheet en mobile,
 *   form-row se colapsa a 1 columna en mobile
 */

import { store } from '../../../store.js';
import { authGuard } from '../../../authGuard.js';
import { showNotification } from '../../notifications/notifications.js';
import { showConfirmModal } from '../../../utils/confirmModal.js';

export default class AdminProductsView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.products = [];
        this.currentImageFile = null;
    }

    async render() {
        if (!authGuard.isAuthenticated() || !authGuard.hasRole('admin')) {
            window.location.href = '/';
            return;
        }

        await this.loadProducts();

        this.container.innerHTML = `
            <div class="admin-page">
                <div class="admin-container">
                    <div class="admin-header">
                        <div>
                            <h1><i class="fas fa-box"></i> Gestionar Productos</h1>
                            <p>Administra el catálogo de productos</p>
                        </div>
                        <button class="btn-primary" id="add-product-btn" data-no-router>
                            <i class="fas fa-plus"></i> Nuevo Producto
                        </button>
                    </div>

                    <div class="admin-layout">
                        <aside class="admin-sidebar">
                            <nav class="admin-nav">
                                <a href="/admin" class="admin-nav-item" data-link>
                                    <i class="fas fa-chart-line"></i>
                                    <span>Dashboard</span>
                                </a>
                                <a href="/admin/productos" class="admin-nav-item active" data-link>
                                    <i class="fas fa-box"></i>
                                    <span>Productos</span>
                                </a>
                                <a href="/admin/blog" class="admin-nav-item" data-link>
                                    <i class="fas fa-newspaper"></i>
                                    <span>Blog</span>
                                </a>
                                <a href="/admin/usuarios" class="admin-nav-item" data-link>
                                    <i class="fas fa-users"></i>
                                    <span>Usuarios</span>
                                </a>
                                <a href="/admin/pedidos" class="admin-nav-item" data-link>
                                    <i class="fas fa-shopping-cart"></i>
                                    <span>Pedidos</span>
                                </a>
                            </nav>
                        </aside>

                        <main class="admin-main">
                            <!-- Wrapper scrollable para tabla en mobile -->
                            <div class="products-list">
                                ${this.renderProductsTable()}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;

        this.initEvents();

        return this;
    }

    async loadProducts() {
        try {
            const token = store.get('auth.token');
            const response = await fetch('/api/admin/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                this.products = data.products;
            } else {
                this.products = [];
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = [];
        }
    }

    renderProductsTable() {
    if (this.products.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No hay productos</h3>
                <p>Agrega tu primer producto usando el botón "Nuevo Producto"</p>
            </div>
        `;
    }

    return `
        <div class="table-wrapper products-list">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Concentración</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.products.map(product => `
                        <tr data-product-id="${product._id}">
                            <td class="product-image-cell">
                                <img src="/assets/images/products/${product.image || 'placeholder.jpg'}"
                                     class="product-table-img"
                                     onerror="this.src='/assets/images/products/placeholder.jpg'">
                            </td>
                            <td class="product-name-cell">
                                <strong>${this.escapeHtml(product.name)}</strong>
                            </td>
                            <td class="product-concentration-cell">
                                ${this.escapeHtml(product.concentration)}
                            </td>
                            <td class="product-price-cell">
                                $${product.price.toLocaleString()}
                            </td>
                            <td class="product-stock-cell">
                                <span class="stock-badge ${product.stock <= 5 ? 'low-stock' : ''}">
                                    ${product.stock || 0} uds
                                </span>
                            </td>
                            <td class="product-status-cell">
                                <span class="status-badge ${product.isActive !== false ? 'active' : 'inactive'}">
                                    ${product.isActive !== false ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td class="product-actions-cell">
                                <div class="action-buttons">
                                    <button class="action-btn edit" data-id="${product._id}" title="Editar" data-no-router>
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete" data-id="${product._id}" title="Eliminar" data-no-router>
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

    initEvents() {
        const addBtn = document.getElementById('add-product-btn');
        if (addBtn) addBtn.addEventListener('click', () => this.showProductModal());

        const emptyAddBtn = document.getElementById('empty-add-product-btn');
        if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => this.showProductModal());

        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const product = this.products.find(p => p._id === id);
                if (product) this.showProductModal(product);
            });
        });

        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const product = this.products.find(p => p._id === id);

                const confirmed = await showConfirmModal({
                    title: 'Eliminar producto de la tienda',
                    message: `¿Estás seguro de que deseas eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`,
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'danger'
                });

                if (!confirmed) return;

                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btn.disabled = true;

                try {
                    const token = store.get('auth.token');
                    const response = await fetch(`/api/admin/products/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        await this.loadProducts();
                        this.render();
                        showNotification('Producto eliminado correctamente', 'success');
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

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'products');

        const token = store.get('auth.token');
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }

    showProductModal(product = null) {
        const isEditing = !!product;

        const existingModal = document.querySelector('.admin-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'admin-modal product-modal';
        modal.innerHTML = `
            <div class="modal-overlay" data-no-router></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="header-info">
                        <i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i>
                        <h3>${isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    </div>
                    <button class="modal-close" data-no-router>&times;</button>
                </div>

                <div class="modal-body">
                    <form id="product-form">
                        <!-- Imagen -->
                        <div class="form-group">
                            <label><i class="fas fa-image"></i> Imagen del producto</label>
                            <div class="image-upload-area" data-no-router>
                                <input type="file" id="product-image-input" accept="image/jpeg,image/png,image/webp" style="display: none;">
                                <div id="image-preview" class="image-preview">
                                    ${product?.image
                                        ? `<img src="/assets/images/products/${product.image}" alt="${product.name}">`
                                        : '<i class="fas fa-cloud-upload-alt"></i>'}
                                </div>
                                <p class="upload-text">${product?.image ? 'Click para cambiar imagen' : 'Haz clic para seleccionar una imagen'}</p>
                                <small>Formatos: JPG, PNG, WEBP (máx. 2MB)</small>
                            </div>
                            <input type="hidden" id="product-image-name" value="${product?.image || ''}">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-tag"></i> Nombre *</label>
                                <input type="text" id="product-name" value="${isEditing ? this.escapeHtml(product.name) : ''}" placeholder="Ej: Jengibre Premium" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-font"></i> Nombre corto</label>
                                <input type="text" id="product-short-name" value="${isEditing ? this.escapeHtml(product.shortName || '') : ''}" placeholder="Ej: Jengibre">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-flask"></i> Concentración *</label>
                                <input type="text" id="product-concentration" value="${isEditing ? this.escapeHtml(product.concentration) : ''}" placeholder="Ej: 500mg" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-dollar-sign"></i> Precio *</label>
                                <input type="number" id="product-price" value="${isEditing ? product.price : ''}" placeholder="0" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-dollar-sign"></i> Precio anterior</label>
                                <input type="number" id="product-old-price" value="${isEditing ? product.oldPrice || '' : ''}" placeholder="Opcional">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-boxes"></i> Stock *</label>
                                <input type="number" id="product-stock" value="${isEditing ? product.stock || 0 : 0}" min="0" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-medal"></i> Badge</label>
                                <select id="product-badge">
                                    <option value="">Ninguno</option>
                                    <option value="BESTSELLER" ${isEditing && product.tag === 'BESTSELLER' ? 'selected' : ''}>⭐ BESTSELLER</option>
                                    <option value="EDICIÓN LIMITADA" ${isEditing && product.tag === 'EDICIÓN LIMITADA' ? 'selected' : ''}>✨ EDICIÓN LIMITADA</option>
                                    <option value="NUEVO" ${isEditing && product.tag === 'NUEVO' ? 'selected' : ''}>🆕 NUEVO</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-palette"></i> Tipo de badge</label>
                                <select id="product-tag-type">
                                    <option value="gold" ${isEditing && product.tagType === 'gold' ? 'selected' : ''}>🥇 Oro</option>
                                    <option value="crimson" ${isEditing && product.tagType === 'crimson' ? 'selected' : ''}>🔴 Carmesí</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-align-left"></i> Descripción corta *</label>
                            <textarea id="product-desc" rows="2" placeholder="Breve descripción del producto..." required>${isEditing ? this.escapeHtml(product.desc) : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-align-justify"></i> Descripción larga</label>
                            <textarea id="product-long-desc" rows="3" placeholder="Descripción detallada...">${isEditing ? this.escapeHtml(product.longDesc || '') : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-check-circle"></i> Beneficios</label>
                            <input type="text" id="product-benefits" value="${isEditing ? (product.benefits || []).join(', ') : ''}" placeholder="Beneficio 1, Beneficio 2, Beneficio 3">
                            <small style="color: var(--bark-light); font-size: 12px; margin-top: 4px; display: block;">Separa cada beneficio con una coma</small>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-mortar-board"></i> Ritual de consumo</label>
                            <textarea id="product-ritual" rows="2" placeholder="Instrucciones de uso...">${isEditing ? this.escapeHtml(product.ritual || '') : ''}</textarea>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-save" data-no-router>
                                <i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Crear'} Producto
                            </button>
                            <button type="button" class="btn-cancel" data-no-router>
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        // Image upload
        const uploadArea = modal.querySelector('.image-upload-area');
        const fileInput = modal.querySelector('#product-image-input');
        const imagePreview = modal.querySelector('#image-preview');
        const imageNameInput = modal.querySelector('#product-image-name');

        if (uploadArea) uploadArea.addEventListener('click', () => fileInput.click());

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);

                try {
                    const result = await this.uploadImage(file);
                    imageNameInput.value = result.filename;
                    showNotification('Imagen subida correctamente', 'success');
                } catch (error) {
                    showNotification(error.message, 'error');
                    if (product?.image) {
                        imagePreview.innerHTML = `<img src="/assets/images/products/${product.image}" alt="${product.name}">`;
                    } else {
                        imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
                    }
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

        const form = modal.querySelector('#product-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const benefitsStr = document.getElementById('product-benefits').value;
                const benefits = benefitsStr.split(',').map(b => b.trim()).filter(b => b);
                const imageName = document.getElementById('product-image-name').value;

                const productData = {
                    name: document.getElementById('product-name').value,
                    shortName: document.getElementById('product-short-name').value,
                    concentration: document.getElementById('product-concentration').value,
                    price: parseFloat(document.getElementById('product-price').value),
                    oldPrice: parseFloat(document.getElementById('product-old-price').value) || null,
                    stock: parseInt(document.getElementById('product-stock').value) || 0,
                    image: imageName || (isEditing ? product.image : 'placeholder.jpg'),
                    tag: document.getElementById('product-badge').value || null,
                    tagType: document.getElementById('product-tag-type').value,
                    desc: document.getElementById('product-desc').value,
                    longDesc: document.getElementById('product-long-desc').value,
                    benefits: benefits,
                    ritual: document.getElementById('product-ritual').value,
                    rating: 4.5,
                    reviews: 0,
                    isActive: true
                };

                const submitBtn = form.querySelector('.btn-save');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

                try {
                    const token = store.get('auth.token');
                    let url = '/api/admin/products';
                    let method = 'POST';

                    if (isEditing) {
                        url = `/api/admin/products/${product._id}`;
                        method = 'PUT';
                    }

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(productData)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        await this.loadProducts();
                        this.render();
                        closeModal();
                        showNotification(isEditing ? 'Producto actualizado' : 'Producto creado', 'success');
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