/**
 * Modal de confirmación personalizado
 */

let activeModal = null;

export function showConfirmModal(options) {
    return new Promise((resolve) => {
        // Cerrar modal existente si hay uno
        if (activeModal) {
            closeModal(activeModal);
        }

        const { title, message, confirmText = 'Cancelar pedido', cancelText = 'Regresar' } = options;

        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="confirm-overlay"></div>
            <div class="confirm-content">
                <div class="confirm-header">
                    <div class="confirm-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>${title || '¿Estás seguro?'}</h3>
                </div>
                <div class="confirm-body">
                    <p>${message || 'Esta acción no se puede deshacer.'}</p>
                </div>
                <div class="confirm-actions">
                    <button class="confirm-cancel">${cancelText}</button>
                    <button class="confirm-confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        activeModal = modal;

        // Animación de entrada
        setTimeout(() => modal.classList.add('active'), 10);

        const close = (result) => {
            closeModal(modal);
            resolve(result);
        };

        const closeModal = (modalEl) => {
            modalEl.classList.remove('active');
            setTimeout(() => {
                if (modalEl.parentNode) modalEl.remove();
                if (activeModal === modalEl) activeModal = null;
            }, 300);
        };

        const confirmBtn = modal.querySelector('.confirm-confirm');
        const cancelBtn = modal.querySelector('.confirm-cancel');
        const overlay = modal.querySelector('.confirm-overlay');

        confirmBtn.addEventListener('click', () => close(true));
        cancelBtn.addEventListener('click', () => close(false));
        overlay.addEventListener('click', () => close(false));

        // Cerrar con tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                close(false);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}