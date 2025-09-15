/**
 * MainPage - Page principale du portfolio
 * Affiche les textes de navigation avec MysteriousText
 */

import { MysteriousText } from '../../ressources/mysterious-text/mysterious-text.js';

export class MainPage {
  constructor() {
    this.p = null;
    this.mysteriousText = null;
    this.isActive = false;
    this.mainTexts = [];
    this.debugFont = null;
  }

  preload(p) {
    // Charger les polices en preload (obligatoire pour WEBGL)
    this.debugFont = p.loadFont('ressources/fonts/CourierPrime-Regular.ttf');

    // Précharger MysteriousText avec polices runiques
    this.mysteriousText = new MysteriousText(p);
    this.mysteriousText.preload();
  }

  init(p) {
    this.p = p;

    // Initialiser MysteriousText (déjà créé en preload)
    this.mysteriousText.init();

    // Configuration des textes principaux
    this.setupMainTexts();

    console.log('=� MainPage initialized');
  }

  setupMainTexts() {
    const center = { x: this.p.width / 2, y: this.p.height / 2 };
    const lineSpacing = 80;

    // Configuration des textes avec leurs actions
    const textConfigs = [
      { text: "Curriculum vitae", yOffset: -1.5, action: "cv" },
      { text: "Bandcamp", yOffset: -0.5, url: "https://reptilianbusinessrecords.bandcamp.com/album/snk-operator" },
      { text: "Soundcloud", yOffset: 0.5, url: "https://soundcloud.com/meo-sound" },
      { text: "Shaderland", yOffset: 1.5, action: "shaderland" }
    ];

    // Créer les objets texte
    this.mainTexts = textConfigs.map(config => {
      const textObj = this.mysteriousText.createTextObj(
        config.text,
        center.x,
        center.y + lineSpacing * config.yOffset,
        15,
        80
      );

      // Ajouter les propriétés d'interaction
      if (config.action) textObj.action = config.action;
      if (config.url) textObj.url = config.url;

      return textObj;
    });
  }

  show() {
    this.isActive = true;
    console.log('=� MainPage shown');
  }

  hide() {
    this.isActive = false;
    console.log('=� MainPage hidden');
  }

  renderToGraphics(graphics) {
    if (!this.isActive || !this.mysteriousText?.isInitialized) return;

    // Rendu des textes sur le buffer graphics pour le shader
    for (let textObj of this.mainTexts) {
      this.mysteriousText.render(textObj, graphics);
    }
  }

  renderToCanvas(p) {
    if (!this.isActive || !this.mysteriousText?.isInitialized) return;

    // Rendu direct sur le canvas sans shader
    for (let textObj of this.mainTexts) {
      this.mysteriousText.render(textObj);
    }
  }

  // Méthode de compatibilité
  update() {
    // Cette méthode n'est plus utilisée mais gardée pour compatibilité
  }

  onMousePressed() {
    if (!this.isActive) return;

    // V�rifier les clics sur les textes
    for (let textObj of this.mainTexts) {
      if (this.mysteriousText.isHoveringText(textObj)) {
        this.handleTextClick(textObj);
        break;
      }
    }
  }

  handleTextClick(textObj) {
    // Déclencher animation shockwave via Brain
    const shockwave = window.brain.getShockwave();
    if (shockwave?.isInitialized) {
      shockwave.triggerBigShockwaveAnimation();
    }

    if (textObj.action === "cv") {
      console.log('🔗 Navigate to CV');
      window.brain.switchTo('cvPage');
    } else if (textObj.action === "shaderland") {
      console.log('<� Navigate to Shaderland');
      // TODO: Navigation vers Shaderland
      // window.brain.switchTo('shaderland');
    } else if (textObj.url) {
      console.log('= Opening URL:', textObj.url);
      window.open(textObj.url, '_blank');
    }
  }
}