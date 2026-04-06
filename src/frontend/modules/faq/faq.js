/**
 * FAQ - Preguntas Frecuentes
 */

export default class FAQView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }

    async render() {
        this.container.innerHTML = `
            <div class="faq-page">
                <section class="faq-hero">
                    <div class="container">
                        <div class="faq-hero-content">
                            <div class="hero-icon">❓</div>
                            <h1>Preguntas Frecuentes</h1>
                            <p>Resolvemos todas tus dudas sobre nuestros productos y servicios</p>
                        </div>
                    </div>
                </section>

                <section class="faq-section">
                    <div class="container">
                        <div class="faq-grid">
                            <div class="faq-category">
                                <h2><i class="fas fa-box"></i> Productos</h2>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿De dónde provienen los ingredientes?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Todos nuestros ingredientes son 100% naturales y provienen de cultivos sostenibles en México. El jengibre y la cúrcuma son de la región de Chiapas, mientras que la manzanilla es de Puebla.</p>
                                    </div>
                                </div>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Cómo debo tomar las cápsulas?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Recomendamos tomar 1 cápsula al día con agua, preferiblemente en ayunas o antes del desayuno para mejor absorción.</p>
                                    </div>
                                </div>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Tienen algún efecto secundario?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Nuestros productos son naturales y generalmente bien tolerados. Sin embargo, si tienes alguna condición médica o estás embarazada, consulta a tu médico antes de consumirlos.</p>
                                    </div>
                                </div>
                            </div>

                            <div class="faq-category">
                                <h2><i class="fas fa-truck"></i> Envíos</h2>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Hacen envíos a toda la República?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Actualmente realizamos envíos solo dentro de Mazatlán, Sinaloa. Estamos trabajando para expandirnos a más ciudades pronto.</p>
                                    </div>
                                </div>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Cuánto tarda el envío?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Los envíos en Mazatlán se entregan en un plazo de 2 a 4 horas hábiles.</p>
                                    </div>
                                </div>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Hay envío gratis?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Sí, ofrecemos envío gratis en compras de 4 o más productos.</p>
                                    </div>
                                </div>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Puedo rastrear mi pedido?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Sí, una vez que tu pedido es enviado, recibirás un número de seguimiento para que puedas rastrearlo en tiempo real.</p>
                                    </div>
                                </div>
                            </div>

                            <div class="faq-category">
                                <h2><i class="fas fa-credit-card"></i> Pagos</h2>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Puedo pagar en efectivo?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Sí, solamente contamos con la opcion de pago en efectivo, se paga en efectivo directamente en nuestro local o cuando llegue tu pedido.</p>
                                    </div>
                                </div>
                            </div>

                            <div class="faq-category">
                                <h2><i class="fas fa-store"></i> Recoger en tienda</h2>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Dónde está la tienda física?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Estamos en Av. del Mar 1235, Zona Dorada, Mazatlán, Sinaloa. Horario: Lun - Sab de 10:00 AM a 8:00 PM.</p>
                                    </div>
                                </div>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Cuánto tarda mi pedido para recoger?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Tu pedido estará listo para recoger en 2-4 horas hábiles. Te notificaremos cuando esté disponible.</p>
                                    </div>
                                </div>
                                <div class="faq-item">
                                    <button class="faq-question">
                                        ¿Qué necesito para recoger mi pedido?
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="faq-answer">
                                        <p>Solo necesitas presentar tu número de pedido y una identificación oficial. Puede recoger otra persona si trae una copia de tu identificación.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="faq-contact">
                    <div class="container">
                        <div class="faq-contact-card">
                            <i class="fas fa-headset"></i>
                            <h3>¿Aún tienes dudas?</h3>
                            <p>Nuestro equipo de soporte está disponible para ayudarte</p>
                            <div class="faq-contact-buttons">
                                <a href="/contacto" class="btn-primary" data-link>Contactar soporte</a>
                                <a href="https://wa.me/5216691024050" class="btn-whatsapp" target="_blank">WhatsApp</a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;

        this.initAccordion();
        return this;
    }

    initAccordion() {
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const faqItem = button.closest('.faq-item');
                const isOpen = faqItem.classList.contains('open');
                
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('open');
                });
                
                if (!isOpen) {
                    faqItem.classList.add('open');
                }
            });
        });
    }

    destroy() {}
}