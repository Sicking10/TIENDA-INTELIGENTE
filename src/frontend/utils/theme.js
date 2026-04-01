/**
 * Manejo de temas (claro/oscuro)
 */

const THEME_KEY = 'theme';

/**
 * Inicializa el tema
 */
export function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(theme);
    
    // Escuchar cambios del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Cambia el tema
 * @param {string} theme - 'light' o 'dark'
 */
export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

/**
 * Alterna entre temas
 */
export function toggleTheme() {
    const current = getCurrentTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
}

/**
 * Obtiene el tema actual
 */
export function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * Verifica si el tema oscuro está activo
 */
export function isDarkMode() {
    return getCurrentTheme() === 'dark';
}