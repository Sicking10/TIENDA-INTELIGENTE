/**
 * Utilidad de fortaleza de contraseña
 * Reutilizable en register.js, profile.js, etc.
 */

// Lista de contraseñas comunes
const COMMON_PASSWORDS = [
    '123456', '12345678', '123456789', '12345', '1234567890',
    'password', 'contraseña', 'contrasena', 'admin', 'qwerty',
    'qwerty123', 'abc123', '111111', '222222', '333333',
    '123123', 'abcabc', 'password123', 'letmein', 'welcome',
    'monkey', 'dragon', 'master', 'sunshine', 'iloveyou',
    'princess', 'football', 'baseball', 'superman', 'batman',
    'asdfgh', 'zxcvbn', 'qazwsx', 'qwertyuiop', '123456a',
    'a123456', '123456q', 'ginger', 'gingercaps', 'mazatlan'
];

/**
 * Verifica si es una contraseña común
 */
export function isCommonPassword(password) {
    const lowerPassword = password.toLowerCase();
    return COMMON_PASSWORDS.includes(lowerPassword);
}

/**
 * Verifica fortaleza de la contraseña
 * @returns {Object} { score, requirements }
 */
export function checkPasswordStrength(password) {
    let score = 0;
    const requirements = {
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
        common: false
    };

    if (password.length >= 8) {
        requirements.length = true;
        score++;
    }

    if (/[A-Z]/.test(password)) {
        requirements.upper = true;
        score++;
    }

    if (/[a-z]/.test(password)) {
        requirements.lower = true;
        score++;
    }

    if (/[0-9]/.test(password)) {
        requirements.number = true;
        score++;
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        requirements.special = true;
        score++;
    }

    if (!isCommonPassword(password)) {
        requirements.common = true;
        score++;
    }

    return { score, requirements };
}

/**
 * Actualiza la UI de fortaleza de contraseña
 * @param {string} password - La contraseña a evaluar
 * @param {Object} elements - Objeto con los elementos DOM
 */
export function updatePasswordStrengthUI(password, elements) {
    const { score, requirements } = checkPasswordStrength(password);
    
    // Actualizar barras de fortaleza
    if (elements.strengthBars) {
        elements.strengthBars.forEach((bar, index) => {
            if (index < score) {
                bar.classList.add('active');
                if (score <= 2) {
                    bar.style.background = '#F44336';
                } else if (score === 3) {
                    bar.style.background = '#FF9800';
                } else if (score === 4) {
                    bar.style.background = '#2196F3';
                } else if (score >= 5) {
                    bar.style.background = '#4CAF50';
                }
            } else {
                bar.classList.remove('active');
                bar.style.background = '';
            }
        });
    }
    
    // Actualizar texto de fortaleza
    if (elements.strengthText) {
        if (password.length === 0) {
            elements.strengthText.textContent = '';
            elements.strengthText.className = '';
        } else if (score <= 2) {
            elements.strengthText.textContent = 'Contraseña débil';
            elements.strengthText.className = 'strength-weak';
        } else if (score === 3) {
            elements.strengthText.textContent = 'Contraseña media';
            elements.strengthText.className = 'strength-medium';
        } else if (score === 4) {
            elements.strengthText.textContent = 'Contraseña fuerte';
            elements.strengthText.className = 'strength-strong';
        } else if (score >= 5) {
            elements.strengthText.textContent = 'Contraseña muy fuerte';
            elements.strengthText.className = 'strength-very-strong';
        }
    }
    
    // Actualizar requisitos individuales
    const reqMap = {
        length: elements.reqLength,
        upper: elements.reqUpper,
        lower: elements.reqLower,
        number: elements.reqNumber,
        special: elements.reqSpecial,
        common: elements.reqCommon
    };
    
    for (const [key, element] of Object.entries(reqMap)) {
        if (element) {
            updateRequirementIcon(element, requirements[key]);
        }
    }
    
    return requirements;
}

/**
 * Actualiza el ícono de un requisito
 */
function updateRequirementIcon(element, isValid) {
    const icon = element.querySelector('i');
    if (icon) {
        if (isValid) {
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#4CAF50';
            element.classList.add('valid');
        } else {
            icon.className = 'fas fa-circle';
            icon.style.color = '';
            element.classList.remove('valid');
        }
    }
}

/**
 * Obtiene los elementos DOM necesarios para la UI de fortaleza
 */
export function getPasswordStrengthElements(containerId = null) {
    const container = containerId ? document.getElementById(containerId) : document;
    
    return {
        strengthBars: container.querySelectorAll('#password-strength .strength-bar'),
        strengthText: container.querySelector('#strength-text'),
        reqLength: container.querySelector('#req-length'),
        reqUpper: container.querySelector('#req-upper'),
        reqLower: container.querySelector('#req-lower'),
        reqNumber: container.querySelector('#req-number'),
        reqSpecial: container.querySelector('#req-special'),
        reqCommon: container.querySelector('#req-common')
    };
}

/**
 * Configura la validación de fortaleza de contraseña en tiempo real
 * @param {HTMLElement} passwordInput - Input de contraseña
 * @param {HTMLElement} confirmInput - Input de confirmación (opcional)
 * @param {Function} onStrengthChange - Callback cuando cambia la fortaleza (opcional)
 */
export function setupPasswordStrengthValidation(passwordInput, confirmInput = null, onStrengthChange = null) {
    if (!passwordInput) return;
    
    const elements = getPasswordStrengthElements();
    
    const updateStrength = () => {
        const password = passwordInput.value;
        const requirements = updatePasswordStrengthUI(password, elements);
        
        if (onStrengthChange) {
            onStrengthChange(requirements);
        }
        
        // Actualizar botón si hay confirmación
        if (confirmInput) {
            const passwordsMatch = confirmInput.value === password;
            const isValid = requirements.length && requirements.upper &&
                           requirements.lower && requirements.number &&
                           requirements.special && requirements.common;
            
            const submitBtn = document.getElementById('register-submit') || 
                            document.getElementById('password-submit');
            if (submitBtn) {
                submitBtn.disabled = !(isValid && passwordsMatch && password.length > 0);
            }
        }
    };
    
    passwordInput.addEventListener('input', updateStrength);
    
    if (confirmInput) {
        confirmInput.addEventListener('input', updateStrength);
    }
    
    return updateStrength;
}

/**
 * Valida que las contraseñas coincidan
 */
export function validatePasswordMatch(passwordInput, confirmInput, errorElement = null) {
    const password = passwordInput?.value || '';
    const confirmPassword = confirmInput?.value || '';
    
    if (confirmPassword && password !== confirmPassword) {
        if (errorElement) {
            errorElement.textContent = '❌ Las contraseñas no coinciden';
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        return true;
    }
}

/**
 * Obtiene mensaje de error de requisitos faltantes
 */
export function getMissingRequirementsMessage(requirements) {
    const missing = [];
    if (!requirements.length) missing.push('❌ Mínimo 8 caracteres');
    if (!requirements.upper) missing.push('❌ Una letra mayúscula');
    if (!requirements.lower) missing.push('❌ Una letra minúscula');
    if (!requirements.number) missing.push('❌ Un número');
    if (!requirements.special) missing.push('❌ Un carácter especial (!@#$%^&*)');
    if (!requirements.common) missing.push('❌ No puede ser una contraseña común');
    return missing;
}