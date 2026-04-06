/**
 * Términos y Condiciones
 */

import LegalView from './legal.js';

export default class TerminosView extends LegalView {
    constructor(container, params = {}) {
        super(container, { ...params, page: 'terminos' });
    }
}