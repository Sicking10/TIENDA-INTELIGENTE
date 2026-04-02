/**
 * Estado global de la aplicación (Store)
 * store.js - Similar a un mini Vuex/Redux pero liviano
 */

class Store {
    constructor() {
        this.state = {
            // Estado de autenticación
            auth: {
                isAuthenticated: false,
                user: null,
                token: null,
                role: null
            },
            
            // Carrito de compras
            cart: {
                items: [],
                total: 0,
                itemCount: 0,
                lastUpdated: null
            },
            
            // Catálogo y productos
            catalog: {
                products: [],
                categories: [],
                featured: [],
                loading: false,
                filters: {
                    category: null,
                    search: '',
                    minPrice: null,
                    maxPrice: null,
                    sortBy: 'popular'
                },
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0
                }
            },
            
            // Pedidos
            orders: {
                list: [],
                currentOrder: null,
                loading: false
            },
            
            // UI
            ui: {
                theme: 'light',
                sidebarOpen: false,
                notifications: [],
                modals: [],
                loading: false
            },
            
            // Sistema
            system: {
                isOnline: navigator.onLine,
                lastSync: null,
                maintenance: false
            }
        };
        
        this.listeners = [];
        this.persistedKeys = ['auth', 'cart', 'ui.theme'];
    }
    
    /**
     * Inicializa el store
     */
    init() {
        this.loadPersistedState();
        this.setupOnlineStatus();
        this.setupAuthListener();
        console.log('📦 Store inicializado');
    }
    
    /**
     * Configura listener para cambios en autenticación
     */
    setupAuthListener() {
        // Escuchar cambios en auth para actualizar UI
        this.subscribe((path, newValue, oldValue, state) => {
            if (path === 'auth.isAuthenticated' || path === 'auth.user') {
                this.updateNavbarAuth();
            }
        });
    }
    
    /**
     * Actualiza la navbar según estado de autenticación
     */
    updateNavbarAuth() {
        const isAuthenticated = this.get('auth.isAuthenticated');
        const user = this.get('auth.user');
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (isAuthenticated && user) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (userName) userName.textContent = user.name || (user.email ? user.email.split('@')[0] : 'Usuario');
            if (userEmail) userEmail.textContent = user.email || 'usuario@ginger.com';
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
    
    /**
     * Carga estado persistido desde localStorage
     */
    loadPersistedState() {
        try {
            // Cargar auth
            const auth = localStorage.getItem('store_auth');
            if (auth) {
                const parsedAuth = JSON.parse(auth);
                this.state.auth = parsedAuth;
                // Actualizar navbar después de cargar auth
                setTimeout(() => this.updateNavbarAuth(), 100);
            }
            
            // Cargar carrito
            const cart = localStorage.getItem('store_cart');
            if (cart) {
                this.state.cart = JSON.parse(cart);
                this.validateCartItems();
            }
            
            // Cargar tema
            const theme = localStorage.getItem('theme');
            if (theme) {
                this.state.ui.theme = theme;
            }
            
        } catch (error) {
            console.error('Error loading persisted state:', error);
        }
    }
    
    /**
     * Valida que los items del carrito sigan existiendo
     */
    validateCartItems() {
        this.state.cart.items = this.state.cart.items.filter(item => item.quantity > 0);
        this.recalculateCartTotals();
    }
    
    /**
     * Recalcula totales del carrito
     */
    recalculateCartTotals() {
        const items = this.state.cart.items;
        this.state.cart.itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        this.state.cart.total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.state.cart.lastUpdated = new Date().toISOString();
    }
    
    /**
     * Guarda estado persistido
     */
    persistState() {
        try {
            localStorage.setItem('store_auth', JSON.stringify(this.state.auth));
            localStorage.setItem('store_cart', JSON.stringify(this.state.cart));
            localStorage.setItem('theme', this.state.ui.theme);
        } catch (error) {
            console.error('Error persisting state:', error);
        }
    }
    
    /**
     * Configura listener de conectividad
     */
    setupOnlineStatus() {
        window.addEventListener('online', () => {
            this.set('system.isOnline', true);
            this.notify('Conexión restablecida', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.set('system.isOnline', false);
            this.notify('Sin conexión a internet', 'warning');
        });
    }
    
    /**
     * Obtiene un valor del estado
     * @param {string} path - Ruta del estado (ej: 'auth.user.name')
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }
    
    /**
     * Actualiza un valor del estado
     * @param {string} path - Ruta del estado
     * @param {any} value - Nuevo valor
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        
        if (target) {
            const oldValue = target[lastKey];
            target[lastKey] = value;
            this.notifyListeners(path, value, oldValue);
            
            // Persistir si es necesario
            if (this.persistedKeys.some(key => path.startsWith(key))) {
                this.persistState();
            }
        }
    }
    
    /**
     * Actualiza múltiples valores
     * @param {object} updates - Objeto con paths y valores
     */
    setMultiple(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.set(path, value);
        });
    }
    
    /**
     * Suscribe un listener a cambios
     * @param {Function} callback - Función a llamar en cada cambio
     * @returns {Function} Función para desuscribir
     */
    subscribe(callback) {
        // Validar que callback sea una función
        if (typeof callback !== 'function') {
            console.warn('[STORE] subscribe: callback no es una función', callback);
            return () => {};
        }
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
    
    /**
     * Notifica a los listeners
     */
    notifyListeners(path, newValue, oldValue) {
        this.listeners.forEach(callback => {
            try {
                if (typeof callback === 'function') {
                    callback(path, newValue, oldValue, this.state);
                } else {
                    console.warn('[STORE] listener no es una función', callback);
                }
            } catch (error) {
                console.error('Error in store listener:', error);
            }
        });
    }
    
    /**
     * Muestra una notificación
     * @param {string} message - Mensaje
     * @param {string} type - Tipo (success, error, warning, info)
     */
    notify(message, type = 'info') {
        const id = Date.now();
        const notification = { id, message, type, timestamp: new Date() };
        
        this.state.ui.notifications.push(notification);
        
        // Auto eliminar después de 5 segundos
        setTimeout(() => {
            this.state.ui.notifications = this.state.ui.notifications.filter(n => n.id !== id);
        }, 5000);
    }
    
    /**
     * Limpia el carrito
     */
    clearCart() {
        this.state.cart.items = [];
        this.state.cart.total = 0;
        this.state.cart.itemCount = 0;
        this.persistState();
        this.notify('Carrito vaciado', 'info');
    }
    
    /**
     * Agrega un item al carrito
     * @param {object} product - Producto a agregar
     * @param {number} quantity - Cantidad
     */
    addToCart(product, quantity = 1) {
        const existingItem = this.state.cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.state.cart.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                maxStock: product.stock || 99
            });
        }
        
        this.recalculateCartTotals();
        this.persistState();
        this.notify(`${product.name} agregado al carrito`, 'success');
    }
    
    /**
     * Elimina un item del carrito
     * @param {string|number} productId - ID del producto
     */
    removeFromCart(productId) {
        const item = this.state.cart.items.find(item => item.id === productId);
        if (item) {
            this.state.cart.items = this.state.cart.items.filter(item => item.id !== productId);
            this.recalculateCartTotals();
            this.persistState();
            this.notify(`${item.name} eliminado del carrito`, 'info');
        }
    }
    
    /**
     * Actualiza cantidad de un item
     * @param {string|number} productId - ID del producto
     * @param {number} quantity - Nueva cantidad
     */
    updateCartItemQuantity(productId, quantity) {
        const item = this.state.cart.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = Math.min(quantity, item.maxStock);
                this.recalculateCartTotals();
                this.persistState();
            }
        }
    }
    
    /**
     * Inicia sesión
     * @param {object} user - Datos del usuario
     * @param {string} token - JWT token
     */
    login(user, token) {
        this.setMultiple({
            'auth.isAuthenticated': true,
            'auth.user': user,
            'auth.token': token,
            'auth.role': user.role || 'user'
        });
        this.updateNavbarAuth();
        this.notify(`¡Bienvenido, ${user.name || user.email}!`, 'success');
    }
    
    /**
     * Cierra sesión
     */
    logout() {
        this.setMultiple({
            'auth.isAuthenticated': false,
            'auth.user': null,
            'auth.token': null,
            'auth.role': null
        });
        this.updateNavbarAuth();
        this.notify('Sesión cerrada', 'info');
    }
}

// Exportar instancia unica
export const store = new Store();