class CvPage {
  constructor() {
    this.isActive = false;
    this.cvContainer = null;
    this.portalElement = null;
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

  async appear() {
    console.log('CvPage appear');
    shockwave.appearEffect();
    this.show();
    await sleep(5000);
    herald.addMessage("> Oh oh oh, this is my CV page", 3000);
  }

  async hide() {
    console.log('CvPage hide');
    shockwave.hideEffect();
    this.hideCV();
  }

  show() {
    this.isActive = true;
    this.cvContainer.style.display = 'flex';
    console.log('📄 CVPage shown');
  }

  hideCV() {
    this.isActive = false;
    this.cvContainer.style.display = 'none';
    console.log('📄 CVPage hidden');
  }

  close() {
    // Méthode séparée pour la fermeture manuelle (Escape, clic extérieur)
    switchTo('mainPage');
  }

  // Méthode principale de rendu
  render() {
    if (!this.isActive) return;

    // CVPage peut choisir d'utiliser Shockwave ou pas
    // Pour l'instant, on désactive Shockwave pour CVPage (HTML pur)
    // Mais on pourrait l'activer pour des transitions spéciales

    if (false && shockwave?.isInitialized) {
      // Option future : Shockwave avec overlay HTML
      shockwave.beginRender(graphics);
      this.renderContent(graphics);
      shockwave.endRender();
    } else {
      // Mode actuel : Pas de Shockwave, CVPage est en HTML pur
      this.renderFallback();
    }
  }

  // Méthode interne : rendu du contenu sur graphics buffer (vide pour CVPage)
  renderContent(graphics) {
    // CVPage pourrait dessiner un fond ou des éléments p5.js ici si besoin
  }

  // Méthode interne : rendu fallback (CVPage = HTML, donc background simple)
  renderFallback() {
    background(244, 243, 241);
    // CVPage affiche son contenu via HTML/CSS, pas p5.js
  }

  onMousePressed() {
    // Pas d'interaction p5.js nécessaire
  }
}