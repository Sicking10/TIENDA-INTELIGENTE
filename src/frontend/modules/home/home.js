/**
 * Home View — GINGERcaps Botanical Apothecary
 * Tienda de cápsulas: Jengibre + Cúrcuma + Manzanilla
 */

import { store } from '../../store.js';
import { showNotification } from '../notifications/notifications.js';
import { updateCartBadge } from '../../utils/cartUtils.js';
import { bumpCartBadge } from '../navbar/navbar.js';

// ─── Data ───────────────────────────────────────────────────────────────────

const PRODUCTS = [
    {
        id: 'ginger-original',
        name: 'GINGERcaps Original',
        concentration: '500mg',
        tag: 'Más vendido',
        tagType: 'popular',
        emoji: '🫚',
        visualClass: 'visual-original',
        desc: 'Fórmula equilibrada de jengibre, cúrcuma y manzanilla para el bienestar diario.',
        price: 349,
        oldPrice: 499,
        featured: false,
        benefits: ['Digestión saludable', 'Efecto antiinflamatorio', 'Energía natural'],
    },
    {
        id: 'ginger-plus',
        name: 'GINGERcaps Plus',
        concentration: '1000mg',
        tag: 'Recomendado',
        tagType: 'recommended',
        emoji: '✨',
        visualClass: 'visual-plus',
        desc: 'Alta concentración para resultados intensificados y soporte inmunológico superior.',
        price: 449,
        oldPrice: 649,
        featured: true,
        benefits: ['Inmunidad fortalecida', 'Reducción de náuseas', 'Apoyo hepático (cúrcuma)'],
    },
    {
        id: 'ginger-pro',
        name: 'GINGERcaps Pro',
        concentration: '1500mg',
        tag: 'Premium',
        tagType: 'premium',
        emoji: '🌿',
        visualClass: 'visual-pro',
        desc: 'Fórmula completa con máxima potencia. Para quienes exigen lo mejor.',
        price: 549,
        oldPrice: 799,
        featured: false,
        benefits: ['Rendimiento máximo', 'Alivio articular', 'Sueño y calma (manzanilla)'],
    },
];

const INGREDIENTS = [
    {
        name: 'Jengibre',
        latin: 'Zingiber officinale',
        emoji: '🫚',
        badge: 'Raíz',
        badgeClass: 'badge-root',
        cardClass: 'card-ginger-ing',
        desc: 'Rico en gingerol y shogaol, potentes compuestos con acción antiinflamatoria, antioxidante y digestiva. Alivia náuseas, mejora la circulación y potencia el sistema inmune.',
        compounds: [
            { label: 'Gingerol', cls: 'compound-tag-g' },
            { label: 'Shogaol', cls: 'compound-tag-g' },
            { label: 'Paradol', cls: 'compound-tag-g' },
        ],
    },
    {
        name: 'Cúrcuma',
        latin: 'Curcuma longa',
        emoji: '🌿',
        badge: 'Especia',
        badgeClass: 'badge-spice',
        cardClass: 'card-turmeric-ing',
        desc: 'La curcumina, su compuesto activo principal, brinda propiedades antiinflamatorias y antioxidantes excepcionales. Apoya la salud hepática, cardiovascular y la función cognitiva.',
        compounds: [
            { label: 'Curcumina', cls: 'compound-tag-t' },
            { label: 'Bisacurone', cls: 'compound-tag-t' },
            { label: 'Turmerone', cls: 'compound-tag-t' },
        ],
    },
    {
        name: 'Manzanilla',
        latin: 'Matricaria chamomilla',
        emoji: '🌼',
        badge: 'Flor',
        badgeClass: 'badge-flower',
        cardClass: 'card-chamomile-ing',
        desc: 'Sus flavonoides y terpenos actúan como ansiolíticos naturales. Favorece el sueño reparador, cuida la piel, alivia el estrés y complementa la acción antibacteriana de la fórmula.',
        compounds: [
            { label: 'Apigenina', cls: 'compound-tag-c' },
            { label: 'Alfa-bisabolol', cls: 'compound-tag-c' },
            { label: 'Camazuleno', cls: 'compound-tag-c' },
        ],
    },
];

const BENEFITS = [
    {
        icon: '🔥',
        iconClass: 'icon-mix',
        title: 'Antiinflamatorio natural',
        text: 'Gingerol + curcumina actúan sinérgicamente para reducir marcadores inflamatorios y el estrés oxidativo celular.',
        source: 'Jengibre · Cúrcuma',
    },
    {
        icon: '🛡️',
        iconClass: 'icon-g',
        title: 'Sistema inmune reforzado',
        text: 'Los compuestos activos estimulan la producción de células defensivas, ayudando a combatir resfriados y virus.',
        source: 'Jengibre · Manzanilla',
    },
    {
        icon: '🧠',
        iconClass: 'icon-t',
        title: 'Función cognitiva y hepática',
        text: 'La curcumina protege neuronas de daño oxidativo y apoya la detoxificación hepática de manera natural.',
        source: 'Cúrcuma',
    },
    {
        icon: '🌙',
        iconClass: 'icon-c',
        title: 'Sueño y gestión del estrés',
        text: 'La apigenina de la manzanilla se une a receptores GABA favoreciendo la relajación y un sueño reparador.',
        source: 'Manzanilla',
    },
    {
        icon: '💚',
        iconClass: 'icon-mix',
        title: 'Salud digestiva integral',
        text: 'El jengibre acelera el vaciado gástrico, reduce náuseas y molestias digestivas en menos de 30 minutos.',
        source: 'Jengibre · Manzanilla',
    },
    {
        icon: '❤️',
        iconClass: 'icon-g',
        title: 'Salud cardiovascular',
        text: 'Mejora la circulación, ayuda a mantener niveles saludables de presión arterial y colesterol LDL.',
        source: 'Jengibre · Cúrcuma',
    },
];

const TESTIMONIALS = [
    {
        name: 'María F.',
        initial: 'M',
        tag: 'Clienta Premium',
        stars: 5,
        quote: 'Desde que incorporé GINGERcaps a mi rutina mi digestión mejoró completamente. Antes de dormir tomo una y duermo como nunca. Llevo 4 meses y no paro.',
    },
    {
        name: 'Carlos R.',
        initial: 'C',
        tag: 'Atleta',
        stars: 5,
        quote: 'Post-entreno, la inflamación muscular bajó notablemente. El jengibre combinado con cúrcuma es brutal para la recuperación. 100% recomendado para deportistas.',
    },
    {
        name: 'Laura M.',
        initial: 'L',
        tag: 'Usuaria fiel',
        stars: 5,
        quote: 'Tengo artritis leve y los episodios de dolor articular se redujeron drásticamente. Además, el efecto calmante de la manzanilla me tiene tranquila todo el día.',
    },
];

const MARQUEE_ITEMS = [
    '🌿 100% Natural',
    '🧪 Clinicamente respaldado',
    '🚚 Envío gratis en la compra de 4 o mas productos',
    '♻️ Empaque sostenible',
    '🌱 Sin aditivos artificiales',
    '⭐ +15,000 clientes satisfechos',
    '🔬 Alta biodisponibilidad',
    '💚 Orgánico certificado',
];

// ─── Render Helpers ──────────────────────────────────────────────────────────

function renderIngredientCards() {
    return INGREDIENTS.map(ing => `
        <div class="ingredient-card ${ing.cardClass} animate-on-scroll">
            <div class="card-top">
                <span class="card-emoji">${ing.emoji}</span>
                <span class="card-badge ${ing.badgeClass}">${ing.badge}</span>
            </div>
            <div class="card-body">
                <h3 class="card-ing-name">${ing.name}</h3>
                <p class="card-ing-latin">${ing.latin}</p>
                <p class="card-ing-desc">${ing.desc}</p>
                <div class="card-compounds">
                    ${ing.compounds.map(c => `<span class="compound-tag ${c.cls}">${c.label}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderBenefits() {
    return BENEFITS.map((b, i) => `
        <div class="benefit-row animate-on-scroll animate-delay-${(i % 4) + 1}">
            <div class="benefit-icon-box ${b.iconClass}">
                <span style="font-size:24px">${b.icon}</span>
            </div>
            <div class="benefit-content">
                <h4 class="benefit-title">${b.title}</h4>
                <p class="benefit-text">${b.text}</p>
                <span class="benefit-source">${b.source}</span>
            </div>
        </div>
    `).join('');
}

function renderProducts() {
    return PRODUCTS.map(p => {
        const saving = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        const badgeMap = {
            popular: 'badge-popular',
            recommended: 'badge-recommended',
            premium: 'badge-premium',
        };

        return `
        <div class="product-card ${p.featured ? 'featured' : ''} animate-on-scroll"
             data-product-id="${p.id}">
            <div class="product-badge ${badgeMap[p.tagType]}">
                ${p.tagType === 'recommended' ? '⭐ ' : ''}${p.tag}
            </div>
            <div class="product-visual ${p.visualClass}">
                <span style="font-size:42px">${p.emoji}</span>
            </div>
            <div class="product-concentration">${p.concentration} / cápsula</div>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.desc}</p>
            <ul class="product-benefits-list">
                ${p.benefits.map(b => `<li>${b}</li>`).join('')}
            </ul>
            <div class="product-price-row">
                <span class="price-current">$${p.price}</span>
                <span class="price-old">$${p.oldPrice}</span>
                <span class="price-save">−${saving}%</span>
            </div>
            <button class="btn-add-cart btn-add-ginger" data-product='${JSON.stringify({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.emoji,
            })}'>
                <span>🛍️</span>
                Agregar al carrito
            </button>
        </div>
        `;
    }).join('');
}

function renderTestimonials() {
    return TESTIMONIALS.map(t => `
        <div class="testimonial-card animate-on-scroll">
            <div class="testimonial-top">
                <div class="testimonial-avatar">${t.initial}</div>
                <div class="testimonial-stars">
                    ${'<span>★</span>'.repeat(t.stars)}
                </div>
            </div>
            <p class="testimonial-quote">${t.quote}</p>
            <div class="testimonial-footer">
                <span class="testimonial-name">${t.name}</span>
                <span class="testimonial-tag">${t.tag}</span>
            </div>
        </div>
    `).join('');
}

function renderMarquee() {
    const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    return doubled.map(item => `
        <div class="marquee-item">
            <span class="marquee-dot"></span>
            ${item}
        </div>
    `).join('');
}

// ─── Main Template ───────────────────────────────────────────────────────────

function getHomeHTML() {
    return `
    <div class="home-ginger">

        <!-- ══════════ HERO ══════════ -->
        <section class="hero-ginger">
            <!-- Background layers -->
            <div class="hero-bg-layer" aria-hidden="true"></div>
            <div class="hero-blob hero-blob-1" aria-hidden="true"></div>
            <div class="hero-blob hero-blob-2" aria-hidden="true"></div>
            <div class="hero-blob hero-blob-3" aria-hidden="true"></div>
            <div class="hero-grain" aria-hidden="true"></div>

            <div class="container">
                <div class="hero-grid">
                    <!-- Left: Content -->
                    <div class="hero-left">
                        <div class="hero-eyebrow">
                            <span class="eyebrow-icon">🌿</span>
                            <span class="eyebrow-text">Bienestar Botánico</span>
                            <span class="eyebrow-dot"></span>
                            <span class="eyebrow-text">México</span>
                        </div>

                        <h1 class="hero-heading">
                            Tres plantas.
                        </h1>
                        <h2 class="hero-sub-heading">
                            <em>Un solo poder.</em>
                        </h2>

                        <p class="hero-description">
                            <span class="ingredient-highlight" title="Antiinflamatorio, digestivo, antioxidante">Jengibre</span>,
                            <span class="ingredient-highlight" title="Curcumina: hígado, cerebro, articulaciones">cúrcuma</span>
                            y <span class="ingredient-highlight" title="Flavonoides: estrés, sueño, piel">manzanilla</span>
                            en una cápsula de alta biodisponibilidad. La forma más inteligente de incorporar la
                            sabiduría natural a tu rutina diaria.
                        </p>

                        <div class="hero-cta-row">
                            <a href="/tienda" class="btn-hero-primary" data-link>
                                Descubrir GINGERcaps
                                <span class="btn-icon">→</span>
                            </a>
                            <a href="/beneficios" class="btn-hero-ghost" data-link>
                                <span>🔬</span> Ver la ciencia
                            </a>
                        </div>

                        <div class="hero-trust">
                            <div class="trust-item">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>100% Orgánico</span>
                            </div>
                            <div class="trust-divider"></div>
                            <div class="trust-item">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>Sin aditivos</span>
                            </div>
                            <div class="trust-divider"></div>
                            <div class="trust-item">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>Envío gratis</span>
                            </div>
                            <div class="trust-divider"></div>
                            <div class="trust-item">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>+15k clientes</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Visual pod -->
                    <div class="hero-right" aria-hidden="true">
                        <div class="hero-pod">
                            <div class="pod-base"></div>
                            <div class="pod-inner">
                                <div class="pod-icon-wrap">
                                    <span class="pod-main-icon">🫚</span>
                                    <span class="pod-icon-label">GINGERcaps</span>
                                </div>
                            </div>

                            <!-- Ingredient bubbles -->
                            <div class="ingredient-bubble bubble-ginger">
                                <div class="bubble-icon-wrap">🫚</div>
                                <span class="bubble-label" style="color:#9A4710">Jengibre</span>
                            </div>
                            <div class="ingredient-bubble bubble-turmeric">
                                <div class="bubble-icon-wrap">🌿</div>
                                <span class="bubble-label" style="color:#9A6A08">Cúrcuma</span>
                            </div>
                            <div class="ingredient-bubble bubble-chamomile">
                                <div class="bubble-icon-wrap">🌼</div>
                                <span class="bubble-label" style="color:#5C7A3E">Manzanilla</span>
                            </div>

                            <!-- Stat cards -->
                            <div class="stat-card stat-card-1">
                                <div class="stat-value">15k+</div>
                                <div class="stat-label">Clientes felices</div>
                            </div>
                            <div class="stat-card stat-card-2">
                                <div class="stat-value">4.9⭐</div>
                                <div class="stat-label">Calificación media</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════ MARQUEE ══════════ -->
        <div class="marquee-strip" aria-label="Características del producto">
            <div class="marquee-track">
                ${renderMarquee()}
            </div>
        </div>

        <!-- ══════════ INGREDIENTES ══════════ -->
        <section class="ingredients-section">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <span class="section-eyebrow">Nuestros ingredientes</span>
                    <h2 class="section-title">
                        La trinidad del <em>bienestar natural</em>
                    </h2>
                    <p class="section-subtitle">
                        Tres plantas con milenios de uso medicinal, potenciadas por extracción de alta biodisponibilidad.
                    </p>
                </div>
                <div class="ingredients-grid">
                    ${renderIngredientCards()}
                </div>
            </div>
        </section>

        <!-- ══════════ BENEFICIOS ══════════ -->
        <section class="benefits-section">
            <div class="container">
                <div class="benefits-layout">
                    <div class="benefits-left animate-on-scroll">
                        <div class="section-header">
                            <span class="section-eyebrow">Ciencia detrás</span>
                            <h2 class="section-title">
                                ¿Por qué <em>funciona</em>?
                            </h2>
                            <p class="section-subtitle">
                                Propiedades respaldadas por investigación científica y uso tradicional milenario.
                            </p>
                        </div>
                        <div class="benefits-stat-block">
                            <div class="stat-big">+32%</div>
                            <p class="stat-big-label">
                                Reducción de marcadores inflamatorios reportada en usuarios con consumo regular de 30 días.
                            </p>
                        </div>
                    </div>
                    <div class="benefits-right">
                        ${renderBenefits()}
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════ CÓMO FUNCIONA ══════════ -->
        <section class="process-section">
            <div class="process-line" aria-hidden="true"></div>
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <span class="section-eyebrow">Simple y efectivo</span>
                    <h2 class="section-title">Tu rutina en <em>3 pasos</em></h2>
                    <p class="section-subtitle">
                        Incorporar GINGERcaps a tu día es más sencillo de lo que imaginas.
                    </p>
                </div>
                <div class="steps-grid">
                    <div class="step-card animate-on-scroll animate-delay-1">
                        <div class="step-number-wrap"><div class="step-num">1</div></div>
                        <span class="step-icon-big">🛒</span>
                        <h3 class="step-title">Elige tu fórmula</h3>
                        <p class="step-text">Selecciona Vegana o No Vegana según tus objetivos y estilo de vida.</p>
                    </div>
                    <div class="step-card animate-on-scroll animate-delay-2">
                        <div class="step-number-wrap"><div class="step-num">2</div></div>
                        <span class="step-icon-big">💧</span>
                        <h3 class="step-title">Una cápsula al día</h3>
                        <p class="step-text">Con agua, en ayunas o con alimentos. La consistencia es la clave.</p>
                    </div>
                    <div class="step-card animate-on-scroll animate-delay-3">
                        <div class="step-number-wrap"><div class="step-num">3</div></div>
                        <span class="step-icon-big">✨</span>
                        <h3 class="step-title">Siente la diferencia</h3>
                        <p class="step-text">Desde la primera semana notarás más energía, mejor digestión y calma interior.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════ TESTIMONIOS ══════════ -->
        <section class="testimonials-section">
            <div class="container">
                <div class="section-header animate-on-scroll">
                    <span class="section-eyebrow">Historias reales</span>
                    <h2 class="section-title">
                        Lo que dicen <em>nuestros clientes</em>
                    </h2>
                    <p class="section-subtitle">
                        Más de 15,000 personas ya transformaron su bienestar con GINGERcaps.
                    </p>
                </div>
                <div class="testimonials-track">
                    ${renderTestimonials()}
                </div>
            </div>
        </section>

        <!-- ══════════ CTA ══════════ -->
        <section class="cta-section">
            <div class="container">
                <div class="cta-inner animate-on-scroll">
                    <!-- Blobs decorativos -->
                    <div class="cta-bg-blob cta-bg-blob-1" aria-hidden="true"></div>
                    <div class="cta-bg-blob cta-bg-blob-2" aria-hidden="true"></div>

                    <span class="cta-eyebrow">Únete al movimiento</span>
                    <h2 class="cta-title">
                        ¿Listo para sentir el<br>poder del <em>jengibre</em>?
                    </h2>
                    <p class="cta-text">
                        Miles de personas ya experimentan los beneficios de GINGERcaps. No esperes más para transformar tu bienestar de forma natural.
                    </p>
                    <div class="cta-actions">
                        <a href="/tienda" class="btn-cta-outline" data-link>
                            Ver todos los productos →
                        </a>
                    </div>
                    <p class="cta-note">Sin compromisos. Cancela cuando quieras.</p>
                </div>
            </div>
        </section>

        <!-- ══════════ FOOTER ══════════ -->
        <footer class="footer-ginger">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-brand-col">
                        <div class="footer-logo-wrap">
                            <div class="footer-logo-icon">🌿</div>
                            <span class="footer-logo-name">GINGER<span>caps</span></span>
                        </div>
                        <p class="footer-brand-desc">
                            Bienestar natural en cada cápsula. La forma más inteligente
                            de incorporar jengibre, cúrcuma y manzanilla a tu vida.
                        </p>
                        <div class="footer-ingredients-row">
                            <span class="footer-ing-tag footer-ing-g">🫚 Jengibre</span>
                            <span class="footer-ing-tag footer-ing-t">🌿 Cúrcuma</span>
                            <span class="footer-ing-tag footer-ing-c">🌼 Manzanilla</span>
                        </div>
                    </div>

                    <div>
                        <h4 class="footer-col-title">Productos</h4>
                        <ul class="footer-links-list">
                            <li><a href="/tienda" data-link>GINGERcaps Original</a></li>
                            <li><a href="/tienda" data-link>GINGERcaps Plus</a></li>
                            <li><a href="/tienda" data-link>GINGERcaps Pro</a></li>
                            <li><a href="/suscripcion" data-link>Suscripciones</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="footer-col-title">Información</h4>
                        <ul class="footer-links-list">
                            <li><a href="/beneficios" data-link>Beneficios</a></li>
                            <li><a href="/blog" data-link>Blog</a></li>
                            <li><a href="/faq" data-link>Preguntas frecuentes</a></li>
                            <li><a href="/contacto" data-link>Contacto</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="footer-col-title">Legal</h4>
                        <ul class="footer-links-list">
                            <li><a href="/terminos" data-link>Términos y condiciones</a></li>
                            <li><a href="/privacidad" data-link>Política de privacidad</a></li>
                            <li><a href="/garantia" data-link>Garantía</a></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p class="footer-copy">© 2024 GINGERcaps — Todos los derechos reservados.</p>
                    <p class="footer-made">Hecho con <span>❤️</span> y <span>🫚</span> en México</p>
                </div>
            </div>
        </footer>
    </div>
    `;
}

// ─── Scroll Animations ───────────────────────────────────────────────────────

function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ─── Add to Cart ─────────────────────────────────────────────────────────────

function initAddToCart() {
    document.querySelectorAll('.btn-add-ginger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productData = JSON.parse(btn.dataset.product);

            // Animación del botón
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => { btn.style.transform = ''; }, 200);

            // Agregar al carrito
            store.addToCart({
                id: productData.id || Date.now(),
                name: productData.name,
                price: productData.price,
                image: productData.image,
                quantity: 1,
            });

            showNotification(`🫚 ${productData.name} agregado al carrito`, 'success');
            updateCartBadge();
            bumpCartBadge();
        });
    });
}

// ─── Navbar scroll highlight ──────────────────────────────────────────────────

function initSectionHighlight() {
    const sections = [
        { el: document.querySelector('.hero-ginger'), href: '/' },
        { el: document.querySelector('.ingredients-section'), href: '/tienda' },
        { el: document.querySelector('.products-section'), href: '/tienda' },
    ];

    // Solo resaltar basado en pathname, no en scroll (demasiado intrusivo)
    // La activación real está en setActiveLink() del navbar
}

// ─── View Class ──────────────────────────────────────────────────────────────

export default class HomeView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this._observers = [];
    }

    async render() {
        this.container.innerHTML = getHomeHTML();

        // Esperar un frame para que el DOM esté listo
        await new Promise(r => requestAnimationFrame(r));

        initScrollAnimations();
        initAddToCart();
        initSectionHighlight();
        updateCartBadge();

        return this;
    }

    destroy() {
        // Limpiar observers si los hubiera guardado
        this._observers.forEach(o => o.disconnect());
        this._observers = [];
    }
}