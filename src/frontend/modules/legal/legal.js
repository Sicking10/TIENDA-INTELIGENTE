/**
 * Legal - Páginas legales (Términos, Privacidad, Garantía)
 */

export default class LegalView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
        this.page = params.page || 'terminos';
    }

    async render() {
        const content = this.getContent();
        
        this.container.innerHTML = `
            <div class="legal-page">
                <section class="legal-hero">
                    <div class="container">
                        <div class="legal-hero-content">
                            <div class="hero-icon">${content.icon}</div>
                            <h1>${content.title}</h1>
                            <p>Última actualización: ${new Date().toLocaleDateString('es-MX')}</p>
                        </div>
                    </div>
                </section>

                <section class="legal-section">
                    <div class="container">
                        <div class="legal-content">
                            ${content.body}
                        </div>
                    </div>
                </section>
            </div>
        `;

        return this;
    }

    getContent() {
        const pages = {
            terminos: {
                icon: "📋",
                title: "Términos y Condiciones",
                body: `
                    <h2>1. Aceptación de los términos</h2>
                    <p>Al acceder y utilizar el sitio web de GINGERcaps, aceptas cumplir con estos términos y condiciones.</p>
                    
                    <h2>2. Productos</h2>
                    <p>Todos nuestros productos son suplementos alimenticios de origen natural. No sustituyen una dieta equilibrada ni un estilo de vida saludable.</p>
                    
                    <h2>3. Precios y pagos</h2>
                    <p>Los precios mostrados son en pesos mexicanos (MXN) e incluyen IVA. Nos reservamos el derecho de modificar precios sin previo aviso.</p>
                    
                    <h2>4. Envíos</h2>
                    <p>Actualmente realizamos envíos únicamente dentro de Mazatlán, Sinaloa. Los tiempos de entrega son de 2 a 4 horas hábiles.</p>
                    
                    <h2>5. Devoluciones y cancelaciones</h2>
                    <p>Aceptamos cancelaciones dentro de las primeras 2 horas después de realizar el pedido. Para productos defectuosos, contacta a soporte dentro de los 7 días posteriores a la recepción.</p>
                    
                    <h2>6. Propiedad intelectual</h2>
                    <p>Todo el contenido del sitio (imágenes, textos, logotipos) es propiedad de GINGERcaps y está protegido por derechos de autor.</p>
                    
                    <h2>7. Contacto</h2>
                    <p>Para cualquier duda sobre estos términos, contáctanos en atencionalcliente.ginger@gmail.com</p>
                `
            },
            privacidad: {
                icon: "🔒",
                title: "Política de Privacidad",
                body: `
                    <h2>1. Información que recopilamos</h2>
                    <p>Recopilamos información personal como nombre, correo electrónico, teléfono y dirección de envío para procesar tus pedidos.</p>
                    
                    <h2>2. Uso de la información</h2>
                    <p>Utilizamos tu información para procesar pedidos, enviar actualizaciones de estado y mejorar nuestro servicio. No vendemos tu información a terceros.</p>
                    
                    <h2>3. Protección de datos</h2>
                    <p>Implementamos medidas de seguridad para proteger tu información personal contra acceso no autorizado.</p>
                    
                    <h2>4. Cookies</h2>
                    <p>Utilizamos cookies para mejorar tu experiencia de navegación y recordar preferencias de carrito.</p>
                    
                    <h2>5. Tus derechos</h2>
                    <p>Tienes derecho a acceder, corregir o eliminar tus datos personales. Contáctanos para ejercer estos derechos.</p>
                    
                    <h2>6. Cambios en la política</h2>
                    <p>Notificaremos cambios significativos en esta política a través de nuestro sitio web.</p>
                `
            },
            garantia: {
                icon: "✅",
                title: "Garantía",
                body: `
                    <h2>Garantía de satisfacción</h2>
                    <p>En GINGERcaps nos comprometemos con la calidad de nuestros productos. Si no estás completamente satisfecho, contáctanos dentro de los primeros 15 días.</p>
                    
                    <h2>Cobertura</h2>
                    <ul>
                        <li>Productos defectuosos de fábrica: cambio sin costo</li>
                        <li>Daños durante el envío: reportar dentro de 24 horas</li>
                        <li>Insatisfacción con el producto: reembolso parcial o crédito en tienda</li>
                    </ul>
                    
                    <h2>Proceso de garantía</h2>
                    <ol>
                        <li>Contacta a atencionalcliente.ginger@gmail.com con tu número de pedido</li>
                        <li>Describe el problema y adjunta fotos si es necesario</li>
                        <li>Te daremos respuesta en menos de 48 horas</li>
                    </ol>
                    
                    <h2>Exclusiones</h2>
                    <p>La garantía no cubre productos dañados por mal uso, almacenamiento incorrecto o después de 30 días de la compra.</p>
                `
            }
        };
        
        return pages[this.page] || pages.terminos;
    }

    destroy() {}
}