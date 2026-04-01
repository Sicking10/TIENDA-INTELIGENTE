/**
 * Módulo Beneficios del Jengibre
 */

export default class BeneficiosView {
    constructor(container, params = {}) {
        this.container = container;
        this.params = params;
    }
    
    async render() {
        this.container.innerHTML = `
            <div class="benefits-page">
                <div class="benefits-hero">
                    <div class="container">
                        <h1>Beneficios del <span>Jengibre</span></h1>
                        <p>Descubre por qué el jengibre es considerado el superalimento milenario</p>
                    </div>
                </div>
                
                <div class="container">
                    <div class="benefits-grid">
                        <div class="benefit-card-large">
                            <div class="benefit-icon"><i class="fas fa-flask"></i></div>
                            <h3>Gingerol: El compuesto activo</h3>
                            <p>El gingerol es el principal componente bioactivo del jengibre, responsable de sus propiedades antiinflamatorias y antioxidantes.</p>
                        </div>
                        
                        <div class="benefits-list">
                            <div class="benefit-item">
                                <i class="fas fa-shield-alt"></i>
                                <div>
                                    <h4>Antiinflamatorio natural</h4>
                                    <p>Ayuda a reducir la inflamación en el cuerpo de forma natural</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-brain"></i>
                                <div>
                                    <h4>Mejora la función cerebral</h4>
                                    <p>Protege contra enfermedades neurodegenerativas</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-heartbeat"></i>
                                <div>
                                    <h4>Salud cardiovascular</h4>
                                    <p>Ayuda a reducir la presión arterial y el colesterol</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-stomach"></i>
                                <div>
                                    <h4>Digestión saludable</h4>
                                    <p>Alivia molestias digestivas y náuseas</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-bolt"></i>
                                <div>
                                    <h4>Aumenta la energía</h4>
                                    <p>Mejora el rendimiento físico y reduce la fatiga</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-shield-virus"></i>
                                <div>
                                    <h4>Fortalece el sistema inmune</h4>
                                    <p>Propiedades antimicrobianas y antivirales</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="scientific-studies">
                        <h2>Respaldado por la ciencia</h2>
                        <div class="studies-grid">
                            <div class="study-card">
                                <div class="study-year">2023</div>
                                <h4>Estudio en Journal of Nutrition</h4>
                                <p>El consumo diario de jengibre reduce marcadores inflamatorios en un 32%</p>
                            </div>
                            <div class="study-card">
                                <div class="study-year">2022</div>
                                <h4>Investigación en Harvard Medical</h4>
                                <p>Beneficios comprobados para la salud digestiva y cardiovascular</p>
                            </div>
                            <div class="study-card">
                                <div class="study-year">2021</div>
                                <h4>Estudio en Nature</h4>
                                <p>El gingerol muestra propiedades neuroprotectoras prometedoras</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return this;
    }
    
    destroy() {}
}