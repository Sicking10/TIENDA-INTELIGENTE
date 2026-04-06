/**
 * Garantía
 */

import LegalView from './legal.js';

export default class GarantiaView extends LegalView {
    constructor(container, params = {}) {
        super(container, { ...params, page: 'garantia' });
    }
}