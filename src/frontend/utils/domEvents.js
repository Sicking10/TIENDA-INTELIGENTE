/**
 * Delegación de eventos DOM
 */

let eventHandlers = new Map();

/**
 * Configura delegación de eventos global
 */
export function setupEventDelegation() {
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('submit', handleGlobalSubmit);
    document.addEventListener('input', handleGlobalInput);
    console.log('🎯 Delegación de eventos configurada');
}

/**
 * Maneja clics globales
 */
function handleGlobalClick(e) {
    // Botones con data-action
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
        const action = actionBtn.dataset.action;
        const handler = eventHandlers.get(action);
        if (handler) {
            e.preventDefault();
            handler(e, actionBtn);
        }
    }
    
    // Modal close
    const closeModal = e.target.closest('[data-close-modal]');
    if (closeModal) {
        const modal = closeModal.closest('.modal');
        if (modal) modal.remove();
    }
}

/**
 * Maneja submits globales
 */
function handleGlobalSubmit(e) {
    const form = e.target.closest('[data-form]');
    if (form) {
        const formName = form.dataset.form;
        const handler = eventHandlers.get(`form:${formName}`);
        if (handler) {
            e.preventDefault();
            handler(e, form);
        }
    }
}

/**
 * Maneja inputs globales
 */
function handleGlobalInput(e) {
    const input = e.target.closest('[data-validate]');
    if (input) {
        validateInput(input);
    }
}

/**
 * Valida un input
 */
function validateInput(input) {
    const rules = input.dataset.validate?.split(',') || [];
    let isValid = true;
    let errorMessage = '';
    
    for (const rule of rules) {
        const [ruleName, ruleValue] = rule.split(':');
        
        switch (ruleName) {
            case 'required':
                if (!input.value.trim()) {
                    isValid = false;
                    errorMessage = 'Este campo es requerido';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Email inválido';
                }
                break;
            case 'min':
                if (input.value.length < parseInt(ruleValue)) {
                    isValid = false;
                    errorMessage = `Mínimo ${ruleValue} caracteres`;
                }
                break;
            case 'max':
                if (input.value.length > parseInt(ruleValue)) {
                    isValid = false;
                    errorMessage = `Máximo ${ruleValue} caracteres`;
                }
                break;
        }
    }
    
    const errorSpan = input.parentElement?.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = errorMessage;
        errorSpan.style.display = isValid ? 'none' : 'block';
    }
    
    input.classList.toggle('invalid', !isValid);
    input.classList.toggle('valid', isValid);
    
    return isValid;
}

/**
 * Registra un manejador para una acción
 * @param {string} action - Nombre de la acción
 * @param {Function} handler - Función manejadora
 */
export function registerAction(action, handler) {
    eventHandlers.set(action, handler);
}

/**
 * Registra un manejador para un formulario
 * @param {string} formName - Nombre del formulario
 * @param {Function} handler - Función manejadora
 */
export function registerForm(formName, handler) {
    eventHandlers.set(`form:${formName}`, handler);
}

/**
 * Elimina un manejador
 * @param {string} key - Clave del manejador
 */
export function unregisterHandler(key) {
    eventHandlers.delete(key);
}

/**
 * Muestra un modal
 * @param {string} content - Contenido HTML del modal
 * @param {object} options - Opciones del modal
 */
export function showModal(content, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay" data-close-modal></div>
        <div class="modal-container ${options.className || ''}">
            ${options.title ? `<div class="modal-header"><h3>${options.title}</h3><button class="modal-close" data-close-modal>&times;</button></div>` : ''}
            <div class="modal-body">${content}</div>
            ${options.buttons ? `<div class="modal-footer">${options.buttons}</div>` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animación de entrada
    setTimeout(() => modal.classList.add('active'), 10);
    
    return modal;
}