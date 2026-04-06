/**
 * Política de Privacidad
 */

import LegalView from './legal.js';

export default class PrivacidadView extends LegalView {
    constructor(container, params = {}) {
        super(container, { ...params, page: 'privacidad' });
    }
}