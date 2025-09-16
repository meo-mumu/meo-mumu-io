/**
 * CVPage - Page du curriculum vitae avec effet portail runique simple
 * Réutilise cv.html et cv.css existants avec animation minimaliste
 */

class CVPage {
  constructor() {
    this.p = null;
    this.isActive = false;
    this.cvContainer = null;
    this.portalElement = null;
  }

  preload(p) {
    // Rien à précharger, utilise les ressources existantes
  }

  init(p) {
    this.p = p;
    this.setupHTML();
    this.setupEventListeners();
    console.log('📄 CVPage initialized');
  }

  setupHTML() {
    // Créer le container CV directement dans p5-container
    this.cvContainer = document.createElement('div');
    this.cvContainer.className = 'cv-page';
    this.cvContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 100;
      overflow-y: auto;
    `;

    this.cvContainer.innerHTML = `
      <div class="cv-content" style="
        width: 90vw;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 101;
      " id="cv-content">
        <!-- Le contenu CV sera chargé ici -->
      </div>
    `;

    document.getElementById('p5-container').appendChild(this.cvContainer);

    // Charger le contenu CV
    this.loadCVContent();
  }

  async loadCVContent() {
    try {
      const response = await fetch('pages/curriculum-vitae/cv.html');
      if (response.ok) {
        const html = await response.text();
        const contentDiv = this.cvContainer.querySelector('#cv-content');
        contentDiv.innerHTML = html;

        // Déclencher les animations data-delay après un délai
        setTimeout(() => this.triggerCVAnimations(), 500);
      }
    } catch (error) {
      console.error('Erreur chargement CV:', error);
    }
  }

  triggerCVAnimations() {
    const elementsWithDelay = this.cvContainer.querySelectorAll('[data-delay]');
    elementsWithDelay.forEach(element => {
      const delay = parseInt(element.getAttribute('data-delay')) || 0;
      setTimeout(() => {
        element.classList.add('animate-in');
      }, delay * 100);
    });
  }

  setupEventListeners() {
    // Fermeture par clic sur le fond
    this.cvContainer.addEventListener('click', (e) => {
      if (e.target === this.cvContainer) {
        this.close();
      }
    });

    // Fermeture par Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.close();
      }
    });
  }

  show() {
    this.isActive = true;
    this.cvContainer.style.display = 'flex';

    console.log('📄 CVPage shown');
  }

  hide() {
    this.isActive = false;
    this.cvContainer.style.display = 'none';

    console.log('📄 CVPage hidden');
  }

  close() {
    // Méthode séparée pour la fermeture manuelle (Escape, clic extérieur)
    if (window.switchTo) {
      window.switchTo('mainPage');
    }
  }

  renderToGraphics(graphics) {
    // CVPage ne rend rien sur le buffer graphics - tout en HTML
  }

  renderToCanvas(p) {
    // CVPage ne rend rien sur le canvas - tout en HTML
  }

  // Méthode de compatibilité
  update() {
    // Cette méthode n'est plus utilisée mais gardée pour compatibilité
  }

  onMousePressed() {
    // Pas d'interaction p5.js nécessaire
  }
}