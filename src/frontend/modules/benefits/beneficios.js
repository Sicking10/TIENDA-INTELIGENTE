/**
 * Módulo Beneficios - GINGERcaps
 * Página completa de beneficios
 */

export default class BeneficiosView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }

    async render() {
        this.container.innerHTML = `
            <div class="benefits-page">
                <!-- Scroll progress -->
                <div class="scroll-progress">
                    <div class="scroll-progress-fill" id="benefits-progress"></div>
                </div>

                <!-- HERO CENTRADO -->
                <section class="benefits-hero">
                    <div class="hero-bg"></div>
                    <div class="hero-texture"></div>
                    <div class="container hero-container">
                        <div class="hero-left">
                            <div class="hero-eyebrow hero-down">
                                <span class="eyebrow-icon">🌿</span>
                                <span class="eyebrow-text">Bienestar desde la raíz</span>
                            </div>
                            <h1 class="hero-title">
                                Beneficios que<br>
                                <em>transforman</em><br>
                                desde adentro
                            </h1>
                            <p class="hero-desc">
                                Tres plantas. Miles de años de sabiduría. Una cápsula que potencia tu bienestar integral, respaldada por la ciencia moderna.
                            </p>
                            <div class="hero-actions">
                                <a href="/tienda" class="btn-primary" data-link>Descubrir productos</a>
                                <a href="#ingredientes" class="btn-ghost" id="scroll-to-ingredients">Ver estudios →</a>
                            </div>
                        </div>
                        <div class="hero-right">
                            <div class="hero-ring-container">
                                <div class="hero-ring"></div>
                                <div class="hero-ring"></div>
                                <div class="hero-ring"></div>
                                <div class="orbit-dot orbit-dot-1"></div>
                                <div class="orbit-dot orbit-dot-2"></div>
                                <div class="orbit-dot orbit-dot-3"></div>
                                <div class="hero-center-img">
                                    <div class="hero-img-placeholder">🫚</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- INGREDIENTES SECTION -->
                <section class="ingredients-section" id="ingredientes">
                    <div class="container">
                        <div class="section-header reveal">
                            <div class="tag">Nuestros ingredientes</div>
                            <h2 class="section-title">La trinidad del <strong>bienestar natural</strong></h2>
                            <p class="section-desc">Cada ingrediente es poderoso por sí solo. Juntos, son extraordinarios.</p>
                        </div>

                        <div class="tab-nav reveal">
                            <button class="tab-btn active" data-tab="ginger">
                                <span class="tab-dot"></span> Jengibre
                            </button>
                            <button class="tab-btn" data-tab="turmeric">
                                <span class="tab-dot"></span> Cúrcuma
                            </button>
                            <button class="tab-btn" data-tab="chamomile">
                                <span class="tab-dot"></span> Manzanilla
                            </button>
                        </div>

                        <!-- JENGIBRE -->
                        <div class="tab-panel active" id="panel-ginger">
                            <div class="ingredient-frame reveal">
                                <div class="ingredient-img-area">
                                    <img src="/assets/images/benefits/jengibre.png" 
     alt="Jengibre fresco - Zingiber officinale"
     class="ingredient-img">
                                </div>
                                <div class="ingredient-badge">
                                    <span class="badge-icon">🔬</span>
                                    <div class="badge-text">
                                        <strong>+2,000 estudios</strong>
                                        <span>publicados en PubMed</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ingredient-content">
                                <div class="tag">Ingrediente estrella</div>
                                <h3 class="ingredient-name"><strong>Jengibre</strong></h3>
                                <span class="ingredient-sci">Zingiber officinale</span>
                                <p class="ingredient-lead">El rey de los antiinflamatorios naturales, cultivado por más de 5,000 años</p>
                                <p class="ingredient-desc">El jengibre ha sido la piedra angular de la medicina tradicional china y ayurvédica. Su compuesto activo, el gingerol, posee propiedades antiinflamatorias documentadas que superan en eficacia a muchos antiinflamatorios convencionales sin efectos secundarios.</p>
                                <div class="compound-highlight">
                                    <div class="cpd-icon"><i class="fas fa-atom"></i></div>
                                    <div class="cpd-body">
                                        <strong>Gingerol — Compuesto bioactivo principal</strong>
                                        <span>Responsable del 80% de las propiedades terapéuticas del jengibre</span>
                                    </div>
                                </div>
                                <div class="benefit-mini">
                                    <div class="bm-card"><div class="bm-icon">🔥</div><div class="bm-title">Antiinflamatorio</div><div class="bm-desc">Reduce marcadores de inflamación hasta un 32%</div></div>
                                    <div class="bm-card"><div class="bm-icon">⚡</div><div class="bm-title">Energía natural</div><div class="bm-desc">Activa el metabolismo sin estimulantes artificiales</div></div>
                                    <div class="bm-card"><div class="bm-icon">🛡️</div><div class="bm-title">Inmunidad</div><div class="bm-desc">Fortalece las defensas contra virus y bacterias</div></div>
                                    <div class="bm-card"><div class="bm-icon">🫁</div><div class="bm-title">Digestión</div><div class="bm-desc">Acelera el vaciado gástrico y reduce náuseas</div></div>
                                </div>
                            </div>
                        </div>

                        <!-- CÚRCUMA -->
                        <div class="tab-panel" id="panel-turmeric">
                            <div class="ingredient-frame reveal">
                                <div class="ingredient-img-area" style="background: linear-gradient(160deg, #FFF3D6 0%, #F5E4B2 100%);">
                                    <img src="/assets/images/benefits/curcuma.png" 
     alt="Cúrcuma en polvo - Curcuma longa"
     class="ingredient-img">
                                </div>
                                <div class="ingredient-badge">
                                    <span class="badge-icon">🏆</span>
                                    <div class="badge-text">
                                        <strong>El oro dorado</strong>
                                        <span>Secreto de la longevidad asiática</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ingredient-content">
                                <div class="tag gold">El oro dorado</div>
                                <h3 class="ingredient-name"><strong>Cúrcuma</strong></h3>
                                <span class="ingredient-sci">Curcuma longa</span>
                                <p class="ingredient-lead" style="color:#b07c10;">Conocida como el "oro de la India" por sus propiedades neuroprotectoras únicas</p>
                                <p class="ingredient-desc">La cúrcuma ha sido venerada durante milenios en la India y el sudeste asiático. Su principio activo, la curcumina, es uno de los compuestos más estudiados en la medicina integrativa, con propiedades que van desde la neuroprotección hasta el cuidado cardiovascular.</p>
                                <div class="compound-highlight turmeric">
                                    <div class="cpd-icon turmeric"><i class="fas fa-dna"></i></div>
                                    <div class="cpd-body">
                                        <strong>Curcumina — El pigmento que protege</strong>
                                        <span>Modula más de 30 vías moleculares relacionadas con la inflamación</span>
                                    </div>
                                </div>
                                <div class="benefit-mini">
                                    <div class="bm-card"><div class="bm-icon">🧠</div><div class="bm-title">Función cognitiva</div><div class="bm-desc">Mejora la memoria y protege neuronas</div></div>
                                    <div class="bm-card"><div class="bm-icon">❤️</div><div class="bm-title">Salud cardiovascular</div><div class="bm-desc">Reduce presión arterial y colesterol LDL</div></div>
                                    <div class="bm-card"><div class="bm-icon">🫀</div><div class="bm-title">Salud hepática</div><div class="bm-desc">Facilita la desintoxicación natural del hígado</div></div>
                                    <div class="bm-card"><div class="bm-icon">🦴</div><div class="bm-title">Articulaciones</div><div class="bm-desc">Alivia el dolor articular y la rigidez crónica</div></div>
                                </div>
                            </div>
                        </div>

                        <!-- MANZANILLA -->
                        <div class="tab-panel" id="panel-chamomile">
                            <div class="ingredient-frame reveal">
                                <div class="ingredient-img-area" style="background: linear-gradient(160deg, #EBF2E3 0%, #D6E8C8 100%);">
                                    <img src="/assets/images/benefits/manzanilla.png" 
     alt="Flores de manzanilla - Matricaria chamomilla"
     class="ingredient-img">
                                </div>
                                <div class="ingredient-badge">
                                    <span class="badge-icon">🌙</span>
                                    <div class="badge-text">
                                        <strong>La flor de la calma</strong>
                                        <span>Usada desde el antiguo Egipto</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ingredient-content">
                                <div class="tag green">La flor de la calma</div>
                                <h3 class="ingredient-name"><strong>Manzanilla</strong></h3>
                                <span class="ingredient-sci">Matricaria chamomilla</span>
                                <p class="ingredient-lead" style="color:var(--stem);">El ansiolítico natural más suave y efectivo que existe en la naturaleza</p>
                                <p class="ingredient-desc">La manzanilla es una de las plantas medicinales más antiguas del mundo, documentada en los papiros egipcios. Sus flavonoides y terpenos actúan como moduladores naturales del sistema nervioso, promoviendo la relajación profunda sin sedación.</p>
                                <div class="compound-highlight chamomile">
                                    <div class="cpd-icon chamomile"><i class="fas fa-leaf"></i></div>
                                    <div class="cpd-body">
                                        <strong>Apigenina — El flavonoide calmante</strong>
                                        <span>Se une a los receptores GABA-A produciendo relajación natural</span>
                                    </div>
                                </div>
                                <div class="benefit-mini">
                                    <div class="bm-card"><div class="bm-icon">🌙</div><div class="bm-title">Sueño reparador</div><div class="bm-desc">Reduce el tiempo para conciliar el sueño</div></div>
                                    <div class="bm-card"><div class="bm-icon">😌</div><div class="bm-title">Reduce estrés</div><div class="bm-desc">Efecto ansiolítico sin efectos secundarios</div></div>
                                    <div class="bm-card"><div class="bm-icon">🤧</div><div class="bm-title">Alivia alergias</div><div class="bm-desc">Propiedades antihistamínicas naturales</div></div>
                                    <div class="bm-card"><div class="bm-icon">✨</div><div class="bm-title">Piel saludable</div><div class="bm-desc">Calma irritaciones y reduce el acné</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SYNERGY SECTION -->
                <section class="synergy-section">
                    <div class="synergy-bg"></div>
                    <div class="container" style="position:relative;z-index:2;">
                        <div style="text-align:center;margin-bottom:16px;" class="reveal">
                            <span style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,0.45);">La magia de la sinergia</span>
                        </div>
                        <h2 class="synergy-title reveal">Juntos son <em>exponencialmente</em><br>más poderosos</h2>
                        <p class="synergy-desc reveal">La combinación de estas tres plantas no suma beneficios, los multiplica. Así funciona la sinergia fitoquímica.</p>
                        <div class="synergy-grid">
                            <div class="sy-card reveal stagger-1">
                                <div class="sy-formula">🫚 + 🌿 Jengibre × Cúrcuma</div>
                                <div class="sy-num">45%</div>
                                <div class="sy-title">Antiinflamatorio potenciado</div>
                                <p class="sy-text">El gingerol activa la biodisponibilidad de la curcumina, aumentando su absorción hasta un 2,000%. Juntos reducen la inflamación un 45% más eficientemente.</p>
                            </div>
                            <div class="sy-card reveal stagger-2">
                                <div class="sy-formula">🌿 + 🌼 Cúrcuma × Manzanilla</div>
                                <div class="sy-num">38%</div>
                                <div class="sy-title">Digestión y calma perfecta</div>
                                <p class="sy-text">La cúrcuma protege la mucosa hepática mientras la manzanilla regula el tránsito intestinal, creando un entorno digestivo óptimo.</p>
                            </div>
                            <div class="sy-card reveal stagger-3">
                                <div class="sy-formula">🫚 + 🌼 Jengibre × Manzanilla</div>
                                <div class="sy-num">52%</div>
                                <div class="sy-title">Energía con equilibrio</div>
                                <p class="sy-text">El jengibre activa el metabolismo y la energía celular, mientras la manzanilla previene la sobreexcitación del sistema nervioso.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- NUMBERS SECTION -->
                <section class="numbers-section">
                    <div class="container">
                        <div class="section-header reveal">
                            <div class="tag">Respaldo científico</div>
                            <h2 class="section-title">Los números <strong>no mienten</strong></h2>
                            <p class="section-desc">Resultados documentados en estudios clínicos revisados por pares</p>
                        </div>
                        <div class="numbers-grid">
                            <div class="n-card reveal"><div class="n-value" data-count="32">0%</div><div class="n-label">Reducción de inflamación</div><div class="n-src">Journal of Nutrition, 2023</div></div>
                            <div class="n-card reveal"><div class="n-value" data-count="28">0%</div><div class="n-label">Mejora cognitiva</div><div class="n-src">Frontiers in Aging, 2022</div></div>
                            <div class="n-card reveal"><div class="n-value" data-count="45">0%</div><div class="n-label">Menos estrés oxidativo</div><div class="n-src">Antioxidants Journal, 2021</div></div>
                            <div class="n-card reveal"><div class="n-value" data-count="15000" data-suffix="k+">0</div><div class="n-label">Clientes satisfechos</div><div class="n-src">y contando cada día</div></div>
                        </div>
                    </div>
                </section>

                <!-- TIMELINE SECTION -->
                <section class="timeline-section">
                    <div class="container">
                        <div class="section-header reveal">
                            <div class="tag">Tu evolución</div>
                            <h2 class="section-title">Lo que sentirás <strong>semana a semana</strong></h2>
                            <p class="section-desc">Un mapa real de tu transformación con GINGERcaps</p>
                        </div>
                        <div class="tl-wrapper">
                            <div class="tl-line"></div>
                            <div class="tl-item reveal"><div class="tl-card"><div class="tl-card-icon">🌱</div><h4>Adaptación y primeras señales</h4><p>Tu sistema digestivo comienza a responder. Mayor energía y reducción de hinchazón abdominal.</p></div><div class="tl-center"><div class="tl-week">Semana 1</div><div class="tl-dot"></div></div><div></div></div>
                            <div class="tl-item reveal"><div></div><div class="tl-center"><div class="tl-week">Semana 2</div><div class="tl-dot" style="background:var(--turmeric)"></div></div><div class="tl-card"><div class="tl-card-icon">⚡</div><h4>Energía sostenida todo el día</h4><p>El gingerol está optimizando tu metabolismo. La fatiga crónica disminuye notablemente.</p></div></div>
                            <div class="tl-item reveal"><div class="tl-card"><div class="tl-card-icon">🛡️</div><h4>Sistema inmune fortalecido</h4><p>Los marcadores inflamatorios comienzan a reducirse. Menos susceptibilidad a resfriados.</p></div><div class="tl-center"><div class="tl-week">Semana 3</div><div class="tl-dot" style="background:var(--stem)"></div></div><div></div></div>
                            <div class="tl-item reveal"><div></div><div class="tl-center"><div class="tl-week">Semana 4+</div><div class="tl-dot" style="background:linear-gradient(135deg,var(--ginger),var(--turmeric));border:none;"></div></div><div class="tl-card" style="border-color:rgba(200,101,27,0.2);"><div class="tl-card-icon">✨</div><h4>Bienestar integral óptimo</h4><p>La sinergia alcanza su máximo efecto. Inflamación reducida, sueño reparador y vitalidad.</p></div></div>
                        </div>
                    </div>
                </section>

                <!-- FAQ SECTION -->
                <section class="faq-section">
                    <div class="container">
                        <div class="section-header reveal">
                            <div class="tag">Preguntas frecuentes</div>
                            <h2 class="section-title">Todo lo que <strong>necesitas saber</strong></h2>
                        </div>
                        <div class="faq-max">
                            <div class="faq-item reveal"><div class="faq-q">¿Cuánto tiempo tarda en hacer efecto? <i class="fas fa-chevron-down"></i></div><div class="faq-a">Los beneficios comienzan a sentirse desde la primera semana. Para resultados óptimos, recomendamos un consumo continuo de al menos 4 semanas.</div></div>
                            <div class="faq-item reveal"><div class="faq-q">¿Tiene efectos secundarios? <i class="fas fa-chevron-down"></i></div><div class="faq-a">GINGERcaps es 100% natural y no presenta efectos secundarios cuando se consume según las indicaciones. Consulta con tu médico si tienes condiciones preexistentes.</div></div>
                            <div class="faq-item reveal"><div class="faq-q">¿Puedo tomarlo con otras medicinas? <i class="fas fa-chevron-down"></i></div><div class="faq-a">Generalmente es seguro, pero si tomas medicamentos anticoagulantes o antihipertensivos, consulta con tu médico antes de comenzar.</div></div>
                            <div class="faq-item reveal"><div class="faq-q">¿Es apto para veganos y celíacos? <i class="fas fa-chevron-down"></i></div><div class="faq-a">Sí. Nuestras cápsulas son 100% vegetales, no contienen gluten, lactosa, soya ni OGMs.</div></div>
                        </div>
                    </div>
                </section>

                <!-- CLOSING CTA -->
                <section class="closing-section">
                    <div class="container">
                        <p class="closing-eyebrow reveal">Comienza tu transformación hoy</p>
                        <h2 class="closing-title reveal">Bienestar natural,<br>para <em>toda la vida</em></h2>
                        <p class="closing-desc reveal">Miles de personas ya viven mejor con GINGERcaps. Es tu turno de experimentar la diferencia.</p>
                        <div class="closing-actions reveal">
                            <a href="/tienda" class="btn-primary" data-link>Comprar GINGERcaps →</a>
                            <a href="/blog" class="btn-ghost" data-link>Leer más en el blog</a>
                        </div>
                    </div>
                </section>
            </div>
        `;

        this.initScrollProgress();
        this.initTabs();
        this.initScrollReveal();
        this.initCounters();
        this.initFaq();
        this.initScrollToIngredients();

        return this;
    }

    initScrollProgress() {
        const progress = document.getElementById('benefits-progress');
        if (progress) {
            window.addEventListener('scroll', () => {
                const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                progress.style.width = pct + '%';
            });
        }
    }

    initTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.tab-panel');
        const tabMap = { ginger: 'panel-ginger', turmeric: 'panel-turmeric', chamomile: 'panel-chamomile' };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                panels.forEach(p => p.classList.remove('active'));
                const targetPanel = document.getElementById(tabMap[tabId]);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
    }

    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.reveal, .tl-item, .n-card, .faq-item, .sy-card').forEach(el => observer.observe(el));
    }

    initCounters() {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const suffix = el.dataset.suffix || '%';
                let start = 0;
                const duration = 1800;
                const step = target / (duration / 16);
                const run = () => {
                    start += step;
                    if (start < target) {
                        el.textContent = Math.floor(start) + suffix;
                        requestAnimationFrame(run);
                    } else {
                        el.textContent = target >= 1000 ? '15k+' : target + suffix;
                    }
                };
                run();
                counterObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.n-value[data-count]').forEach(el => counterObserver.observe(el));
    }

    initFaq() {
        document.querySelectorAll('.faq-q').forEach(q => {
            q.addEventListener('click', () => {
                const item = q.parentElement;
                const isOpen = item.classList.contains('open');
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            });
        });
    }

    initScrollToIngredients() {
        const scrollBtn = document.getElementById('scroll-to-ingredients');
        if (scrollBtn) {
            scrollBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const ingredientsSection = document.getElementById('ingredientes');
                if (ingredientsSection) {
                    ingredientsSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    destroy() { }
}