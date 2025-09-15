/**
 * Shockwave - Ressource shader d'ondes de choc
 * Génère des effets d'ondes basés sur les mouvements de souris
 */

export class Shockwave {
  constructor(p) {
    this.p = p;
    this.shader = null;
    this.isInitialized = false;

    // Configuration shockwave
    this.NUM_SHOCKWAVES = 10;
    this.centres = new Array(this.NUM_SHOCKWAVES);
    this.times = new Array(this.NUM_SHOCKWAVES);
    this.sizes = new Array(this.NUM_SHOCKWAVES);

    // Mouse tracking
    this.previousMouseX = 0;
    this.previousMouseY = 0;
    this.mouseSpeedThreshold = 7;
    this.lastWaveTime = 0;
    this.waveDelay = 75;

    // Graphics buffer
    this.graphics = null;
  }

  preload() {
    // Charger le shader en preload (obligatoire pour WEBGL)
    this.shader = this.p.loadShader(
      'ressources/shaders/vert/main-v3.vert',
      'ressources/shaders/frag/shock.frag'
    );
  }

  init() {
    // Créer le buffer graphics
    this.graphics = this.p.createGraphics(this.p.width, this.p.height);
    this.graphics.textAlign(this.p.CENTER, this.p.CENTER);
    this.graphics.fill(80);

    // Initialiser les shockwaves
    for(let i = 0; i < this.NUM_SHOCKWAVES; i++) {
      this.centres[i] = [0, 0];
      this.times[i] = 1;
      this.sizes[i] = 1.0;
    }

    this.isInitialized = true;
    console.log('🌊 Shockwave initialized');
  }

  // Fonction utilitaire smoothstep
  smoothstep(edge0, edge1, x) {
    let t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  // Générer une shockwave
  generateShockwave(x, y, size = 1.0) {
    this.centres.shift();
    this.times.shift();
    this.sizes.shift();
    this.centres.push([x / this.p.width, y / this.p.height]);
    this.times.push(0);
    this.sizes.push(size);
  }

  // Détecter la vitesse de la souris et générer des ondes
  handleMouseSpeed() {
    let deltaX = this.p.mouseX - this.previousMouseX;
    let deltaY = this.p.mouseY - this.previousMouseY;
    let mouseSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (mouseSpeed > this.mouseSpeedThreshold && this.p.millis() - this.lastWaveTime > this.waveDelay) {
      let minSize = 0.0;
      let maxSize = 1.2;
      let normalizedSpeed = Math.min(mouseSpeed / 35, 1.0);

      let threshold1 = 0.6;
      let threshold2 = 0.8;
      let threshold3 = 0.9;

      let waveSize;
      if (normalizedSpeed < threshold1) {
        waveSize = minSize;
      } else if (normalizedSpeed < threshold2) {
        let t = this.smoothstep(threshold1, threshold2, normalizedSpeed);
        waveSize = minSize + (maxSize * 0.0003 - minSize) * t;
      } else if (normalizedSpeed < threshold3) {
        let t = this.smoothstep(threshold2, threshold3, normalizedSpeed);
        waveSize = maxSize * 0.1 + (maxSize * 0.5 - maxSize * 0.2) * t;
      } else {
        let t = this.smoothstep(threshold3, 1.0, normalizedSpeed);
        waveSize = maxSize * 0.8 + (maxSize - maxSize * 0.9) * t;
      }

      this.generateShockwave(this.p.mouseX, this.p.mouseY, waveSize);
      this.lastWaveTime = this.p.millis();
    }

    this.previousMouseX = this.p.mouseX;
    this.previousMouseY = this.p.mouseY;
  }

  // Séquence d'animation de grandes shockwaves
  triggerBigShockwaveAnimation() {
    const shockwavePoints = [
      { x: this.p.width * 0.2, y: this.p.height * 0.3, size: 2.0 },
      { x: this.p.width * 0.8, y: this.p.height * 0.2, size: 1.8 },
      { x: this.p.width * 0.1, y: this.p.height * 0.7, size: 2.2 },
      { x: this.p.width * 0.9, y: this.p.height * 0.8, size: 1.9 },
      { x: this.p.width * 0.5, y: this.p.height * 0.1, size: 2.1 },
      { x: this.p.width * 0.4, y: this.p.height * 0.9, size: 2.0 },
    ];

    shockwavePoints.forEach((point, index) => {
      setTimeout(() => {
        this.generateShockwave(point.x, point.y, point.size);
      }, index * 100);
    });
  }

  // Commencer le rendu avec le buffer graphics
  beginRender() {
    if (!this.isInitialized) return;

    this.handleMouseSpeed();
    this.graphics.background(244, 243, 241);
    this.p.clear();
  }

  // Finaliser le rendu avec le shader
  endRender() {
    if (!this.isInitialized) return;

    // Mise à jour des uniforms du shader
    let centresUniform = [];
    let timesUniform = [];
    let sizesUniform = [];

    for(let i = 0; i < this.NUM_SHOCKWAVES; i++) {
      if(this.times[i] < 1) {
        this.times[i] += 0.005;
      }
      centresUniform = centresUniform.concat(this.centres[i]);
      timesUniform.push(Math.pow(this.times[i], 1/1.5));
      sizesUniform.push(this.sizes[i]);
    }

    this.p.shader(this.shader);
    this.shader.setUniform("centres", centresUniform);
    this.shader.setUniform("times", timesUniform);
    this.shader.setUniform("sizes", sizesUniform);
    this.shader.setUniform("image", this.graphics);
    this.shader.setUniform("aspect", [1, this.p.width/this.p.height]);

    this.p.rect(-this.p.width/2, -this.p.height/2, this.p.width, this.p.height);
  }

  // Obtenir le buffer graphics pour dessiner dessus
  getGraphics() {
    return this.graphics;
  }
}