/**
 * Brain.js - Orchestrateur principal du portfolio
 * Gère l'instance p5.js unique et la navigation entre les Pages
 */

// Import des Pages
import { MainPage } from '../pages/main-page/mainPage.js';
import { CVPage } from '../pages/curriculum-vitae/cvPage.js';

// Import des ressources communes
import { Shockwave } from '../ressources/shockwave/shockwave.js';

class Brain {
  constructor() {
    this.p5Instance = null;
    this.activePage = null;
    this.pages = new Map();
    this.shockwave = null;
  }

  init() {
    // Créer l'instance p5.js globale
    this.p5Instance = new p5(this.coreP5Logic.bind(this), 'p5-container');

    // Enregistrer les Pages
    this.registerPage('mainPage', new MainPage());
    this.registerPage('cvPage', new CVPage());

    // Démarrer avec la MainPage
    this.switchTo('mainPage');
  }

  registerPage(name, pageInstance) {
    this.pages.set(name, pageInstance);
  }

  getShockwave() {
    return this.shockwave;
  }

  switchTo(pageName) {
    // Masquer la page actuelle
    if (this.activePage) {
      this.activePage.hide();
    }

    // Activer la nouvelle page
    this.activePage = this.pages.get(pageName);
    if (this.activePage) {
      this.activePage.show();
    }
  }

  coreP5Logic(p) {
    p.preload = () => {
      // Précharger les ressources communes
      this.shockwave = new Shockwave(p);
      this.shockwave.preload();

      // Les pages se chargent en preload pour les fonts
      for (let page of this.pages.values()) {
        page.preload(p);
      }
    };

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
      p.background(244, 243, 241);

      // Initialiser les ressources communes
      this.shockwave.init();

      // Initialiser les pages après setup
      for (let page of this.pages.values()) {
        page.init(p);
      }
    };

    p.draw = () => {
      p.translate(-p.width/2, -p.height/2);

      // Rendu du background commun avec shockwave
      if (this.shockwave?.isInitialized) {
        this.shockwave.beginRender();
        const graphics = this.shockwave.getGraphics();

        // La page active rend son contenu sur le buffer graphics
        if (this.activePage) {
          this.activePage.renderToGraphics(graphics);
        }

        // Finaliser avec le shader shockwave
        this.shockwave.endRender();
      } else {
        // Version fallback sans shader
        p.background(244, 243, 241);
        if (this.activePage) {
          this.activePage.renderToCanvas(p);
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    p.mousePressed = () => {
      if (this.activePage) {
        this.activePage.onMousePressed();
      }
    };
  }
}

// Initialiser le Brain quand le DOM est prêt
window.addEventListener('DOMContentLoaded', () => {
  const brain = new Brain();
  window.brain = brain; // Exposer globalement pour debug
  brain.init();
  console.log('🧠 Brain initialized');
});