/**
 * Módulo de Notificaciones
 * Sistema de notificaciones en tiempo real con agrupación (anti-spam)
 */

let notificationContainer = null;
let notificationQueue = [];
let isProcessing = false;

// Almacenar notificaciones activas para agrupar
const activeNotifications = new Map();

/**
 * Inicializa el sistema de notificaciones
 */
export function initNotifications() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    console.log('🔔 Sistema de notificaciones inicializado');
}

/**
 * Genera una clave única para el mensaje (para agrupar)
 */
function getMessageKey(message, type) {
    return `${type}:${message.toLowerCase().trim()}`;
}

/**
 * Actualiza una notificación existente con contador
 */
function updateExistingNotification(notification, message, count) {
    const contentDiv = notification.querySelector('.notification-content p');
    const existingMessage = contentDiv.textContent.replace(/\(\d+\)/g, '').trim();
    contentDiv.innerHTML = `${existingMessage} <span class="notification-count">(${count})</span>`;
    
    // Reiniciar el timeout
    if (notification._timeout) {
        clearTimeout(notification._timeout);
    }
    
    notification._timeout = setTimeout(() => {
        removeNotification(notification);
        activeNotifications.delete(getMessageKey(existingMessage, notification._type));
    }, 3000);
}

/**
 * Muestra una notificación (con agrupación anti-spam)
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms (default: 3000)
 */
export function showNotification(message, type = 'info', duration = 3000) {
    if (!notificationContainer) {
        initNotifications();
    }
    
    const messageKey = getMessageKey(message, type);
    const existingNotification = activeNotifications.get(messageKey);
    
    // Si ya existe una notificación con el mismo mensaje, actualizar el contador
    if (existingNotification) {
        const currentCount = existingNotification._count || 1;
        const newCount = currentCount + 1;
        existingNotification._count = newCount;
        updateExistingNotification(existingNotification, message, newCount);
        return existingNotification;
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification._type = type;
    notification._count = 1;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notificationContainer.appendChild(notification);
    activeNotifications.set(messageKey, notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Botón cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
        activeNotifications.delete(messageKey);
    });
    
    // Auto cerrar
    notification._timeout = setTimeout(() => {
        removeNotification(notification);
        activeNotifications.delete(messageKey);
    }, duration);
    
    return notification;
}

/**
 * Elimina una notificación
 * @param {HTMLElement} notification - Elemento de notificación
 */
function removeNotification(notification) {
    if (notification._timeout) {
        clearTimeout(notification._timeout);
    }
    
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

/**
 * Muestra notificación de éxito
 */
export function showSuccess(message, duration = 3000) {
    return showNotification(message, 'success', duration);
}

/**
 * Muestra notificación de error
 */
export function showError(message, duration = 3000) {
    return showNotification(message, 'error', duration);
}

/**
 * Muestra notificación de advertencia
 */
export function showWarning(message, duration = 3000) {
    return showNotification(message, 'warning', duration);
}

/**
 * Muestra notificación de información
 */
export function showInfo(message, duration = 3000) {
    return showNotification(message, 'info', duration);
}

/**
 * Limpia todas las notificaciones
 */
export function clearNotifications() {
    if (notificationContainer) {
        activeNotifications.clear();
        notificationContainer.innerHTML = '';
    }
}