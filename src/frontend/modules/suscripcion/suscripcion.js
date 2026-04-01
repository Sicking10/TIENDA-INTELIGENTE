/**
 * Módulo Suscripción
 */

export default class SuscripcionView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="subscription-page">
                <div class="container">
                    <div class="subscription-header">
                        <h1>Planes de Suscripción</h1>
                        <p>Elige el plan que mejor se adapte a tu rutina</p>
                    </div>
                    
                    <div class="subscription-plans">
                        <div class="plan-card">
                            <div class="plan-icon"><i class="fas fa-seedling"></i></div>
                            <h3>Plan Básico</h3>
                            <div class="plan-price">$299 <span>/mes</span></div>
                            <ul class="plan-features">
                                <li><i class="fas fa-check"></i> 1 frasco al mes</li>
                                <li><i class="fas fa-check"></i> 30 cápsulas</li>
                                <li><i class="fas fa-check"></i> Envío estándar</li>
                            </ul>
                            <button class="btn-select-plan">Seleccionar plan</button>
                        </div>
                        
                        <div class="plan-card popular">
                            <div class="plan-badge">Más popular</div>
                            <div class="plan-icon"><i class="fas fa-leaf"></i></div>
                            <h3>Plan Plus</h3>
                            <div class="plan-price">$549 <span>/mes</span></div>
                            <ul class="plan-features">
                                <li><i class="fas fa-check"></i> 2 frascos al mes</li>
                                <li><i class="fas fa-check"></i> 60 cápsulas</li>
                                <li><i class="fas fa-check"></i> Envío express gratis</li>
                                <li><i class="fas fa-check"></i> 10% descuento</li>
                            </ul>
                            <button class="btn-select-plan primary">Seleccionar plan</button>
                        </div>
                        
                        <div class="plan-card">
                            <div class="plan-icon"><i class="fas fa-crown"></i></div>
                            <h3>Plan Pro</h3>
                            <div class="plan-price">$999 <span>/mes</span></div>
                            <ul class="plan-features">
                                <li><i class="fas fa-check"></i> 4 frascos al mes</li>
                                <li><i class="fas fa-check"></i> 120 cápsulas</li>
                                <li><i class="fas fa-check"></i> Envío prioritario</li>
                                <li><i class="fas fa-check"></i> 20% descuento</li>
                                <li><i class="fas fa-check"></i> Regalo exclusivo</li>
                            </ul>
                            <button class="btn-select-plan">Seleccionar plan</button>
                        </div>
                    </div>
                    
                    <div class="subscription-info">
                        <div class="info-card">
                            <i class="fas fa-truck"></i>
                            <h4>Envíos mensuales</h4>
                            <p>Recibe tus cápsulas cada mes sin preocupaciones</p>
                        </div>
                        <div class="info-card">
                            <i class="fas fa-credit-card"></i>
                            <h4>Pago seguro</h4>
                            <p>Cancelación en cualquier momento sin penalización</p>
                        </div>
                        <div class="info-card">
                            <i class="fas fa-gift"></i>
                            <h4>Beneficios exclusivos</h4>
                            <p>Acceso a promociones y productos exclusivos</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initPlanButtons();
        
        return this;
    }
    
    initPlanButtons() {
        const buttons = document.querySelectorAll('.btn-select-plan');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Próximamente: Sistema de suscripciones');
            });
        });
    }
    
    destroy() {}
}