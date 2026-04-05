/**
 * Utilidad para toggle de visibilidad de contraseña
 * Agrega un botón de ojo a los campos de tipo password
 */

/**
 * Agrega el botón de ojo a un campo de contraseña
 * @param {HTMLElement} inputElement - El input de tipo password
 * @param {Object} options - Opciones adicionales
 */
export function addPasswordToggle(inputElement, options = {}) {
    if (!inputElement || inputElement.type !== 'password') return;
    
    // Guardar el ancho original del input
    const originalWidth = inputElement.style.width;
    const originalFlex = inputElement.style.flex;
    
    // Crear contenedor para el input y el botón
    const wrapper = document.createElement('div');
    wrapper.className = 'password-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';
    
    // Insertar el wrapper antes del input y mover el input dentro
    inputElement.parentNode.insertBefore(wrapper, inputElement);
    wrapper.appendChild(inputElement);
    
    // Asegurar que el input ocupe todo el ancho del wrapper
    inputElement.style.width = '100%';
    inputElement.style.boxSizing = 'border-box';
    
    // Crear el botón del ojo
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.right = '12px';
    toggleBtn.style.top = '50%';
    toggleBtn.style.transform = 'translateY(-50%)';
    toggleBtn.style.background = 'transparent';
    toggleBtn.style.border = 'none';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.color = 'var(--gray-500)';
    toggleBtn.style.fontSize = '16px';
    toggleBtn.style.padding = '0';
    toggleBtn.style.zIndex = '1';
    toggleBtn.style.transition = 'color 0.2s ease';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    
    wrapper.appendChild(toggleBtn);
    
    // Ajustar padding del input para que no se superponga con el botón
    inputElement.style.paddingRight = '40px';
    
    // Evento para mostrar/ocultar contraseña
    let isVisible = false;
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isVisible = !isVisible;
        inputElement.type = isVisible ? 'text' : 'password';
        toggleBtn.innerHTML = isVisible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        toggleBtn.style.color = isVisible ? 'var(--ginger)' : 'var(--gray-500)';
    });
    
    // Hover effect
    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.color = 'var(--ginger)';
    });
    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.color = isVisible ? 'var(--ginger)' : 'var(--gray-500)';
    });
    
    return wrapper;
}

/**
 * Agrega el botón de ojo a múltiples campos de contraseña
 * @param {string|HTMLElement} container - Contenedor o selector donde buscar inputs password
 */
export function addPasswordToggles(container) {
    const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (!containerEl) return;
    
    const passwordInputs = containerEl.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => addPasswordToggle(input));
}