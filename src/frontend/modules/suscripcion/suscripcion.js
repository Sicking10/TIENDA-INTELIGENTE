/**
 * Módulo Suscripción - GINGERcaps
 * Planes de suscripción mensual con beneficios exclusivos
 */

import { store } from '../../store.js';
import { authGuard } from '../../authGuard.js';
import { showNotification } from '../notifications/notifications.js';
import { formatPrice } from '../../utils/cartUtils.js';

export default class SuscripcionView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.selectedPlan = null;
        this.currentStep = 1;
        this.frequency = 'monthly';
        this.userData = {};
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="subscription-page">
                <!-- Hero -->
                <section class="subscription-hero">
                    <div class="subscription-hero-bg">
                        <div class="hero-glow hero-glow-1"></div>
                        <div class="hero-glow hero-glow-2"></div>
                        <div class="hero-glow hero-glow-3"></div>
                    </div>
                    <div class="container">
                        <div class="subscription-hero-content">
                            <div class="hero-badge">
                                <span>🌿 Suscripción mensual</span>
                            </div>
                            <h1>Bienestar <span class="gradient-word">sin interrupciones</span></h1>
                            <p>Recibe tus cápsulas cada mes en la puerta de tu casa, ahorra hasta un 20% y disfruta de beneficios exclusivos</p>
                            <div class="hero-benefits">
                                <div class="benefit-item">
                                    <i class="fas fa-truck"></i>
                                    <span>Envío gratis</span>
                                </div>
                                <div class="benefit-item">
                                    <i class="fas fa-percent"></i>
                                    <span>Hasta 20% off</span>
                                </div>
                                <div class="benefit-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>Pausa o cancela</span>
                                </div>
                                <div class="benefit-item">
                                    <i class="fas fa-gift"></i>
                                    <span>Regalos exclusivos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Planes -->
                <section class="plans-section">
                    <div class="container">
                        <div class="section-header">
                            <span class="section-tag">Elige tu plan</span>
                            <h2>Planes de <span class="accent">suscripción</span></h2>
                            <p>Selecciona el plan que mejor se adapte a tus necesidades</p>
                        </div>

                        <!-- Toggle de frecuencia -->
                        <div class="frequency-toggle">
                            <button class="freq-btn active" data-freq="monthly">
                                Mensual
                                <span class="freq-save">Ahorra 0%</span>
                            </button>
                            <button class="freq-btn" data-freq="quarterly">
                                Trimestral
                                <span class="freq-save">Ahorra 15%</span>
                            </button>
                            <button class="freq-btn" data-freq="yearly">
                                Anual
                                <span class="freq-save">Ahorra 20%</span>
                            </button>
                        </div>

                        <div class="plans-grid" id="plans-grid">
                            ${this.renderPlans()}
                        </div>

                        <!-- Comparativa de beneficios -->
                        <div class="comparison-section">
                            <div class="section-header small">
                                <h3>Compara todos los beneficios</h3>
                                <p>Más ventajas al suscribirte</p>
                            </div>
                            <div class="comparison-table">
                                <div class="comparison-row">
                                    <div class="comparison-cell feature">Envío gratis</div>
                                    <div class="comparison-cell basic">❌</div>
                                    <div class="comparison-cell plus">✅</div>
                                    <div class="comparison-cell pro">✅</div>
                                </div>
                                <div class="comparison-row">
                                    <div class="comparison-cell feature">Descuento sobre precio regular</div>
                                    <div class="comparison-cell basic">5%</div>
                                    <div class="comparison-cell plus">10%</div>
                                    <div class="comparison-cell pro">20%</div>
                                </div>
                                <div class="comparison-row">
                                    <div class="comparison-cell feature">Acceso a productos exclusivos</div>
                                    <div class="comparison-cell basic">❌</div>
                                    <div class="comparison-cell plus">✅</div>
                                    <div class="comparison-cell pro">✅</div>
                                </div>
                                <div class="comparison-row">
                                    <div class="comparison-cell feature">Soporte prioritario</div>
                                    <div class="comparison-cell basic">❌</div>
                                    <div class="comparison-cell plus">❌</div>
                                    <div class="comparison-cell pro">✅</div>
                                </div>
                                <div class="comparison-row">
                                    <div class="comparison-cell feature">Regalo de bienvenida</div>
                                    <div class="comparison-cell basic">❌</div>
                                    <div class="comparison-cell plus">✅</div>
                                    <div class="comparison-cell pro">✅</div>
                                </div>
                                <div class="comparison-row">
                                    <div class="comparison-cell feature">Flexibilidad de pausa/cancelación</div>
                                    <div class="comparison-cell basic">✅</div>
                                    <div class="comparison-cell plus">✅</div>
                                    <div class="comparison-cell pro">✅</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Cómo funciona -->
                <section class="how-it-works">
                    <div class="container">
                        <div class="section-header">
                            <span class="section-tag">Simple y fácil</span>
                            <h2>¿Cómo <span class="accent">funciona</span>?</h2>
                            <p>Tres pasos para empezar a recibir tus cápsulas</p>
                        </div>
                        <div class="steps-grid">
                            <div class="step-card">
                                <div class="step-number">1</div>
                                <div class="step-icon">📋</div>
                                <h3>Elige tu plan</h3>
                                <p>Selecciona el plan que mejor se adapte a tus necesidades</p>
                            </div>
                            <div class="step-card">
                                <div class="step-number">2</div>
                                <div class="step-icon">✏️</div>
                                <h3>Completa tus datos</h3>
                                <p>Ingresa tu información de envío y pago seguro</p>
                            </div>
                            <div class="step-card">
                                <div class="step-number">3</div>
                                <div class="step-icon">📦</div>
                                <h3>Recibe cada mes</h3>
                                <p>Disfruta de tus cápsulas sin preocuparte por reordenar</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- FAQ -->
                <section class="faq-section">
                    <div class="container">
                        <div class="section-header">
                            <span class="section-tag">Preguntas frecuentes</span>
                            <h2>Todo lo que necesitas <span class="accent">saber</span></h2>
                        </div>
                        <div class="faq-grid">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Puedo pausar mi suscripción?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Sí, puedes pausar tu suscripción en cualquier momento desde tu panel de control. No hay cargos ocultos ni permanencia mínima.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Cómo se realiza el pago?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>El pago se realiza automáticamente cada mes con la tarjeta que registres. Puedes cambiarla cuando quieras desde tu perfil.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Puedo cambiar de plan?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Sí, puedes actualizar tu plan en cualquier momento. El cambio se aplicará en tu próximo ciclo de facturación.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Qué pasa si no estoy satisfecho?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Ofrecemos garantía de satisfacción. Si no estás conforme, puedes cancelar y te reembolsaremos el último pago.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Los precios incluyen envío?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Los planes Plus y Pro incluyen envío gratis. El plan Básico tiene un costo adicional de envío de $79 MXN.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Cuándo se procesa mi pedido?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Tu pedido se procesa el mismo día que se realiza el cobro mensual. Recibirás un correo de confirmación.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- CTA Final -->
                <section class="cta-section">
                    <div class="container">
                        <div class="cta-card">
                            <div class="cta-content">
                                <h2>¿Listo para empezar?</h2>
                                <p>Únete a cientos de personas que ya disfrutan de los beneficios de GINGERcaps</p>
                                <div class="cta-buttons">
                                    <button class="btn-cta-primary" id="start-subscription">
                                        Comenzar ahora
                                        <i class="fas fa-arrow-right"></i>
                                    </button>
                                    <button class="btn-cta-secondary" id="contact-sales">
                                        ¿Tienes dudas?
                                        <i class="fas fa-headset"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
        
        this.initFrequencyToggle();
        this.initPlanButtons();
        this.initFaq();
        this.initCtaButtons();
        
        return this;
    }
    
    renderPlans() {
        const plans = [
            {
                id: 'basic',
                name: 'Plan Básico',
                icon: '🌱',
                price: 299,
                priceQuarterly: 254,
                priceYearly: 239,
                features: [
                    '1 frasco al mes',
                    '30 cápsulas',
                    'Envío estándar (+$79)',
                    'Acceso a la comunidad'
                ],
                badge: null,
                popular: false,
                discount: 0,
                color: '#A0A0A0'
            },
            {
                id: 'plus',
                name: 'Plan Plus',
                icon: '🌟',
                price: 549,
                priceQuarterly: 467,
                priceYearly: 439,
                features: [
                    '2 frascos al mes',
                    '60 cápsulas',
                    'Envío express gratis',
                    '10% descuento',
                    'Regalo de bienvenida'
                ],
                badge: 'Más popular',
                popular: true,
                discount: 10,
                color: '#D97A2B'
            },
            {
                id: 'pro',
                name: 'Plan Pro',
                icon: '👑',
                price: 999,
                priceQuarterly: 849,
                priceYearly: 799,
                features: [
                    '4 frascos al mes',
                    '120 cápsulas',
                    'Envío prioritario gratis',
                    '20% descuento',
                    'Regalo exclusivo',
                    'Soporte prioritario'
                ],
                badge: 'Ahorro máximo',
                popular: false,
                discount: 20,
                color: '#E8A838'
            }
        ];
        
        return plans.map(plan => {
            let currentPrice = plan.price;
            let saveText = '';
            
            if (this.frequency === 'quarterly') {
                currentPrice = plan.priceQuarterly;
                saveText = 'Ahorra 15%';
            } else if (this.frequency === 'yearly') {
                currentPrice = plan.priceYearly;
                saveText = 'Ahorra 20%';
            }
            
            return `
                <div class="plan-card ${plan.popular ? 'popular' : ''}" data-plan-id="${plan.id}">
                    ${plan.badge ? `<div class="plan-badge">${plan.badge}</div>` : ''}
                    <div class="plan-icon">${plan.icon}</div>
                    <h3>${plan.name}</h3>
                    <div class="plan-price">
                        ${formatPrice(currentPrice)}
                        <span>/mes</span>
                    </div>
                    ${saveText ? `<div class="plan-save">${saveText}</div>` : ''}
                    <ul class="plan-features">
                        ${plan.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                    </ul>
                    <button class="btn-select-plan ${plan.popular ? 'primary' : ''}" data-plan="${plan.id}">
                        ${this.frequency === 'monthly' ? 'Suscribirme' : 'Suscribirme con ahorro'}
                    </button>
                </div>
            `;
        }).join('');
    }
    
    initFrequencyToggle() {
        const freqBtns = document.querySelectorAll('.freq-btn');
        freqBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                freqBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.frequency = btn.dataset.freq;
                this.updatePlans();
            });
        });
    }
    
    updatePlans() {
        const plansGrid = document.getElementById('plans-grid');
        if (plansGrid) {
            plansGrid.innerHTML = this.renderPlans();
            this.initPlanButtons();
        }
    }
    
    initPlanButtons() {
        const buttons = document.querySelectorAll('.btn-select-plan');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planId = btn.dataset.plan;
                this.selectedPlan = planId;
                this.showCheckoutModal();
            });
        });
    }
    
    showCheckoutModal() {
        const isAuthenticated = store.get('auth.isAuthenticated');
        
        if (!isAuthenticated) {
            showNotification('Debes iniciar sesión para suscribirte', 'warning');
            sessionStorage.setItem('redirectAfterLogin', '/suscripcion');
            window.location.href = '/login';
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'subscription-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmar suscripción</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="plan-summary">
                        <div class="plan-summary-icon">🌟</div>
                        <div class="plan-summary-info">
                            <h4>Plan ${this.selectedPlan === 'basic' ? 'Básico' : this.selectedPlan === 'plus' ? 'Plus' : 'Pro'}</h4>
                            <p>Suscripción ${this.frequency === 'monthly' ? 'mensual' : this.frequency === 'quarterly' ? 'trimestral' : 'anual'}</p>
                        </div>
                    </div>
                    
                    <form id="subscription-form" class="subscription-form">
                        <div class="form-group">
                            <label>Nombre completo</label>
                            <input type="text" id="sub-name" placeholder="Juan Pérez" required>
                        </div>
                        <div class="form-group">
                            <label>Correo electrónico</label>
                            <input type="email" id="sub-email" placeholder="juan@email.com" required>
                        </div>
                        <div class="form-group">
                            <label>Dirección de envío</label>
                            <input type="text" id="sub-address" placeholder="Calle 123, Colonia, Ciudad" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Tarjeta</label>
                                <input type="text" placeholder="**** **** **** 1234">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" placeholder="123">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Mes</label>
                                <select>
                                    <option>01</option><option>02</option><option>03</option><option>04</option>
                                    <option>05</option><option>06</option><option>07</option><option>08</option>
                                    <option>09</option><option>10</option><option>11</option><option>12</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Año</label>
                                <select>
                                    <option>2024</option><option>2025</option><option>2026</option>
                                    <option>2027</option><option>2028</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-checkbox">
                            <label class="checkbox-label">
                                <input type="checkbox" required> Acepto los <a href="/terminos">términos y condiciones</a>
                            </label>
                        </div>
                        <button type="submit" class="btn-confirm-subscription">
                            Confirmar suscripción
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        const form = modal.querySelector('#subscription-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('¡Suscripción confirmada! Recibirás tu primer pedido en 3-5 días hábiles.', 'success');
            modal.remove();
        });
    }
    
    initFaq() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
    
    initCtaButtons() {
        const startBtn = document.getElementById('start-subscription');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                document.querySelector('.plans-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        const contactBtn = document.getElementById('contact-sales');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                showNotification('Próximamente: Soporte en vivo', 'info');
            });
        }
    }
    
    destroy() {}
}