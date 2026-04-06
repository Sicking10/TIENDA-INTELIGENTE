/**
 * Contacto - Página de contacto
 */

import { showNotification } from '../notifications/notifications.js';

export default class ContactoView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }

    async render() {
        this.container.innerHTML = `
            <div class="contact-page">
                <section class="contact-hero">
                    <div class="container">
                        <div class="contact-hero-content">
                            <div class="hero-icon">📞</div>
                            <h1>Contacto</h1>
                            <p>Estamos aquí para ayudarte</p>
                        </div>
                    </div>
                </section>

                <section class="contact-section">
                    <div class="container">
                        <div class="contact-grid">
                            <div class="contact-info">
                                <div class="contact-card">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <h3>Visítanos</h3>
                                    <p>Av. del Mar 1235, Zona Dorada</p>
                                    <p>Marina Mazatlán, Mazatlán, Sinaloa</p>
                                    <p>CP 82110</p>
                                </div>
                                <div class="contact-card">
                                    <i class="fas fa-phone-alt"></i>
                                    <h3>Llámanos</h3>
                                    <p>Teléfono: +52 1 669 102 4050</p>
                                    <p>WhatsApp: +52 1 669 102 4050</p>
                                </div>
                                <div class="contact-card">
                                    <i class="fas fa-envelope"></i>
                                    <h3>Escríbenos</h3>
                                    <p>soporte@gingercaps.com</p>
                                    <p>ventas@gingercaps.com</p>
                                </div>
                                <div class="contact-card">
                                    <i class="fas fa-clock"></i>
                                    <h3>Horario</h3>
                                    <p>Lunes a Viernes: 10:00 AM - 6:00 PM</p>
                                    <p>Sábados: 10:00 AM - 2:00 PM</p>
                                </div>
                            </div>

                            <div class="contact-form">
                                <h2>Envíanos un mensaje</h2>
                                <form id="contact-form">
                                    <div class="form-group">
                                        <input type="text" id="contact-name" placeholder="Tu nombre" required>
                                    </div>
                                    <div class="form-group">
                                        <input type="email" id="contact-email" placeholder="Tu correo electrónico" required>
                                    </div>
                                    <div class="form-group">
                                        <input type="tel" id="contact-phone" placeholder="Tu teléfono">
                                    </div>
                                    <div class="form-group">
                                        <select id="contact-subject">
                                            <option value="consulta">Consulta general</option>
                                            <option value="pedido">Problema con mi pedido</option>
                                            <option value="producto">Duda sobre producto</option>
                                            <option value="devolucion">Devolución o garantía</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <textarea id="contact-message" rows="5" placeholder="Escribe tu mensaje aquí..." required></textarea>
                                    </div>
                                    <button type="submit" class="btn-primary">Enviar mensaje</button>
                                </form>
                                <p class="form-note">Te responderemos en menos de 24 horas hábiles.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="contact-map">
                    <div class="container">
                        <h2>Ubicación</h2>
                        <div class="map-container">
                            <iframe 
                                src="https://maps.google.com/maps?q=23.2428,-106.4206&z=15&output=embed"
                                width="100%" 
                                height="400" 
                                style="border:0;" 
                                allowfullscreen="" 
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>
                </section>
            </div>
        `;

        this.initForm();
        return this;
    }

    initForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
                
                // Obtener datos del formulario
                const formData = {
                    name: document.getElementById('contact-name').value,
                    email: document.getElementById('contact-email').value,
                    phone: document.getElementById('contact-phone').value,
                    subject: document.getElementById('contact-subject').value,
                    message: document.getElementById('contact-message').value
                };
                
                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        showNotification('Mensaje enviado. Te contactaremos pronto.', 'success');
                        form.reset();
                    } else {
                        throw new Error(data.message || 'Error al enviar el mensaje');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification(error.message, 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        }
    }

    destroy() {}
}