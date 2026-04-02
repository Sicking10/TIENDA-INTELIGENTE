/**
 * Módulo Beneficios - GINGERcaps
 * Página exclusiva de beneficios - Diseño refinado
 */

export default class BeneficiosView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="benefits-page">
                <!-- Hero Refinado -->
                <section class="benefits-hero">
                    <div class="hero-backdrop">
                        <div class="hero-glow hero-glow-1"></div>
                        <div class="hero-glow hero-glow-2"></div>
                        <div class="hero-glow hero-glow-3"></div>
                    </div>
                    <div class="container">
                        <div class="hero-content">
                            <div class="hero-chip">
                                <span>🌿 El poder de la naturaleza</span>
                            </div>
                            <h1 class="hero-title">
                                Beneficios que<br>
                                <span class="gradient-word">transforman</span> tu vida
                            </h1>
                            <p class="hero-description">
                                Descubre cómo el jengibre, la cúrcuma y la manzanilla trabajan en sinergia 
                                para ofrecerte bienestar integral, respaldado por siglos de sabiduría ancestral 
                                y validado por la ciencia moderna.
                            </p>
                            <div class="hero-scroll">
                                <span>Explorar beneficios</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Beneficio Destacado - Jengibre -->
                <section class="benefit-showcase">
                    <div class="container">
                        <div class="benefit-showcase-inner">
                            <div class="benefit-visual">
                                <div class="visual-orb">
                                    <div class="orb-core">
                                        <span>🫚</span>
                                    </div>
                                    <div class="orb-ring ring-1"></div>
                                    <div class="orb-ring ring-2"></div>
                                    <div class="orb-ring ring-3"></div>
                                </div>
                            </div>
                            <div class="benefit-details">
                                <div class="benefit-tag">Ingrediente estrella</div>
                                <h2>Jengibre <span class="scientific">Zingiber officinale</span></h2>
                                <p class="benefit-lead">El rey de los antiinflamatorios naturales</p>
                                <p class="benefit-description">El jengibre ha sido utilizado durante más de 5000 años en la medicina tradicional china y ayurvédica. Su compuesto activo, el gingerol, es responsable de sus potentes propiedades antiinflamatorias y antioxidantes.</p>
                                <div class="benefit-grid-mini">
                                    <div class="mini-card">
                                        <i class="fas fa-fire"></i>
                                        <div>
                                            <h4>Gingerol</h4>
                                            <p>Compuesto bioactivo con potentes propiedades antiinflamatorias</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-stomach"></i>
                                        <div>
                                            <h4>Digestión saludable</h4>
                                            <p>Acelera el vaciado gástrico y reduce náuseas</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-bolt"></i>
                                        <div>
                                            <h4>Energía natural</h4>
                                            <p>Reduce la fatiga y mejora el rendimiento físico</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-shield-virus"></i>
                                        <div>
                                            <h4>Inmunidad</h4>
                                            <p>Fortalece las defensas contra infecciones</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Beneficio Destacado - Cúrcuma -->
                <section class="benefit-showcase alt">
                    <div class="container">
                        <div class="benefit-showcase-inner reverse">
                            <div class="benefit-visual">
                                <div class="visual-orb turmeric-orb">
                                    <div class="orb-core">
                                        <span>🌿</span>
                                    </div>
                                    <div class="orb-ring ring-1"></div>
                                    <div class="orb-ring ring-2"></div>
                                    <div class="orb-ring ring-3"></div>
                                </div>
                            </div>
                            <div class="benefit-details">
                                <div class="benefit-tag">El oro dorado</div>
                                <h2>Cúrcuma <span class="scientific">Curcuma longa</span></h2>
                                <p class="benefit-lead">El secreto de la longevidad asiática</p>
                                <p class="benefit-description">La cúrcuma es conocida como el "oro dorado" de la India. Su compuesto activo, la curcumina, ha sido ampliamente estudiado por sus propiedades antiinflamatorias, antioxidantes y neuroprotectoras.</p>
                                <div class="benefit-grid-mini">
                                    <div class="mini-card">
                                        <i class="fas fa-brain"></i>
                                        <div>
                                            <h4>Función cognitiva</h4>
                                            <p>Protege las neuronas del daño oxidativo</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-heart"></i>
                                        <div>
                                            <h4>Salud cardiovascular</h4>
                                            <p>Reduce la presión arterial y el colesterol</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-liver"></i>
                                        <div>
                                            <h4>Salud hepática</h4>
                                            <p>Ayuda a desintoxicar el hígado naturalmente</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-joint"></i>
                                        <div>
                                            <h4>Articulaciones</h4>
                                            <p>Alivia el dolor y la rigidez articular</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Beneficio Destacado - Manzanilla -->
                <section class="benefit-showcase">
                    <div class="container">
                        <div class="benefit-showcase-inner">
                            <div class="benefit-visual">
                                <div class="visual-orb chamomile-orb">
                                    <div class="orb-core">
                                        <span>🌼</span>
                                    </div>
                                    <div class="orb-ring ring-1"></div>
                                    <div class="orb-ring ring-2"></div>
                                    <div class="orb-ring ring-3"></div>
                                </div>
                            </div>
                            <div class="benefit-details">
                                <div class="benefit-tag">La flor de la calma</div>
                                <h2>Manzanilla <span class="scientific">Matricaria chamomilla</span></h2>
                                <p class="benefit-lead">El ansiolítico natural más suave y efectivo</p>
                                <p class="benefit-description">La manzanilla ha sido utilizada desde el antiguo Egipto por sus propiedades calmantes. Sus flavonoides y terpenos actúan como ansiolíticos naturales, favoreciendo la relajación y el sueño reparador.</p>
                                <div class="benefit-grid-mini">
                                    <div class="mini-card">
                                        <i class="fas fa-moon"></i>
                                        <div>
                                            <h4>Sueño reparador</h4>
                                            <p>Favorece la relajación y el descanso profundo</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-smile"></i>
                                        <div>
                                            <h4>Reduce el estrés</h4>
                                            <p>Efecto ansiolítico suave y natural</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-allergies"></i>
                                        <div>
                                            <h4>Alivia alergias</h4>
                                            <p>Propiedades antihistamínicas naturales</p>
                                        </div>
                                    </div>
                                    <div class="mini-card">
                                        <i class="fas fa-hand-sparkles"></i>
                                        <div>
                                            <h4>Cuidado de la piel</h4>
                                            <p>Calma irritaciones y reduce el acné</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- La Sinergia -->
                <section class="synergy-section">
                    <div class="container">
                        <div class="synergy-header">
                            <div class="synergy-chip">Sinergia perfecta</div>
                            <h2>Juntos, son <span class="gradient-word">más poderosos</span></h2>
                            <p>La combinación única de estas tres plantas crea un efecto potenciado que multiplica sus beneficios individuales</p>
                        </div>
                        <div class="synergy-grid">
                            <div class="synergy-card">
                                <div class="synergy-icon">🫚 + 🌿</div>
                                <h3>Antiinflamatorio potenciado</h3>
                                <p>La combinación de gingerol y curcumina reduce la inflamación hasta un 45% más que cada uno por separado</p>
                            </div>
                            <div class="synergy-card">
                                <div class="synergy-icon">🌿 + 🌼</div>
                                <h3>Digestión y calma</h3>
                                <p>La cúrcuma protege el hígado mientras la manzanilla calma el sistema digestivo</p>
                            </div>
                            <div class="synergy-card">
                                <div class="synergy-icon">🫚 + 🌼</div>
                                <h3>Energía con equilibrio</h3>
                                <p>El jengibre energiza mientras la manzanilla evita la sobreexcitación nerviosa</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Beneficios en números -->
                <section class="numbers-section">
                    <div class="container">
                        <div class="numbers-header">
                            <h2>Respaldo <span class="gradient-word">científico</span></h2>
                            <p>Lo que dicen los estudios clínicos</p>
                        </div>
                        <div class="numbers-grid">
                            <div class="number-card">
                                <div class="number-value" data-count="32">32%</div>
                                <div class="number-label">Reducción de marcadores inflamatorios</div>
                                <div class="number-source">Journal of Nutrition, 2023</div>
                            </div>
                            <div class="number-card">
                                <div class="number-value" data-count="28">28%</div>
                                <div class="number-label">Mejora en función cognitiva</div>
                                <div class="number-source">Frontiers in Aging, 2022</div>
                            </div>
                            <div class="number-card">
                                <div class="number-value" data-count="45">45%</div>
                                <div class="number-label">Reducción del estrés oxidativo</div>
                                <div class="number-source">Antioxidants, 2021</div>
                            </div>
                            <div class="number-card">
                                <div class="number-value" data-count="15">15k+</div>
                                <div class="number-label">Clientes satisfechos</div>
                                <div class="number-source">Más de 15,000 personas</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Timeline de beneficios -->
                <section class="timeline-section">
                    <div class="container">
                        <div class="timeline-header">
                            <h2>Tu evolución hacia el <span class="gradient-word">bienestar</span></h2>
                            <p>Lo que sentirás semana a semana con GINGERcaps</p>
                        </div>
                        <div class="timeline">
                            <div class="timeline-track">
                                <div class="timeline-item">
                                    <div class="timeline-marker">
                                        <span class="marker-week">Semana 1</span>
                                        <div class="marker-dot"></div>
                                    </div>
                                    <div class="timeline-content">
                                        <h4>🌱 Adaptación</h4>
                                        <p>Comienza a sentir mayor energía y mejor digestión. Tu cuerpo empieza a asimilar los compuestos activos.</p>
                                    </div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-marker">
                                        <span class="marker-week">Semana 2</span>
                                        <div class="marker-dot"></div>
                                    </div>
                                    <div class="timeline-content">
                                        <h4>⚡ Energía sostenida</h4>
                                        <p>Reducción notable de la fatiga y mejora en la concentración. El gingerol comienza a hacer efecto.</p>
                                    </div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-marker">
                                        <span class="marker-week">Semana 3</span>
                                        <div class="marker-dot"></div>
                                    </div>
                                    <div class="timeline-content">
                                        <h4>🛡️ Inmunidad fortalecida</h4>
                                        <p>Tu cuerpo está más preparado para combatir virus y bacterias. Menos resfriados y malestares.</p>
                                    </div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-marker">
                                        <span class="marker-week">Semana 4+</span>
                                        <div class="marker-dot"></div>
                                    </div>
                                    <div class="timeline-content">
                                        <h4>✨ Bienestar integral</h4>
                                        <p>Resultados óptimos: inflamación reducida, mejor sueño, y una sensación general de bienestar.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- FAQ de beneficios -->
                <section class="faq-section">
                    <div class="container">
                        <div class="faq-header">
                            <h2>Preguntas <span class="gradient-word">frecuentes</span></h2>
                            <p>Todo lo que necesitas saber sobre nuestros beneficios</p>
                        </div>
                        <div class="faq-grid">
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Cuánto tiempo tarda en hacer efecto?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Los beneficios comienzan a sentirse desde la primera semana, con mejoras notables en energía y digestión. Para resultados óptimos, recomendamos un consumo continuo de al menos 4 semanas.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Tiene efectos secundarios?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>GINGERcaps es 100% natural y no presenta efectos secundarios cuando se consume según las indicaciones. Como con cualquier suplemento, recomendamos consultar con un profesional de la salud si tienes condiciones médicas preexistentes.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Puedo tomarlo con otras medicinas?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Generalmente es seguro, pero si estás tomando medicamentos anticoagulantes o para la presión arterial, consulta con tu médico antes de comenzar a tomarlo.</p>
                                </div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question">
                                    <span>¿Es apto para veganos?</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="faq-answer">
                                    <p>Sí, nuestras cápsulas son 100% vegetales y no contienen ingredientes de origen animal.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- CTA Final -->
                <section class="closing-section">
                    <div class="container">
                        <div class="closing-card">
                            <div class="closing-icon">🌿</div>
                            <h2>Bienestar natural, <span>para siempre</span></h2>
                            <p>Incorporar GINGERcaps a tu rutina diaria es el primer paso hacia una vida más saludable, equilibrada y llena de energía.</p>
                            <div class="closing-buttons">
                                <a href="/tienda" class="closing-btn-primary" data-link>Conocer productos</a>
                                <a href="/blog" class="closing-btn-secondary" data-link>Leer más en el blog</a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
        
        this.initCounters();
        this.initScrollAnimations();
        this.initFaq();
        
        return this;
    }
    
    initCounters() {
        const counters = document.querySelectorAll('.number-value');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = element.dataset.count;
                    if (target) {
                        let start = 0;
                        const duration = 2000;
                        const step = parseInt(target) / (duration / 16);
                        const updateCounter = () => {
                            start += step;
                            if (start < parseInt(target)) {
                                element.textContent = Math.floor(start) + (target.includes('k+') ? 'k+' : '%');
                                requestAnimationFrame(updateCounter);
                            } else {
                                element.textContent = target;
                            }
                        };
                        updateCounter();
                    }
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.benefit-showcase, .synergy-card, .number-card, .timeline-item, .faq-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(el => observer.observe(el));
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
    
    destroy() {}
}