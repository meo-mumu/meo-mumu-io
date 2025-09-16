/**
 * Shockwave - Ressource shader d'ondes de choc
 * Génère des effets d'ondes basés sur les mouvements de souris
 */

class Shockwave {
  constructor() {
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

    // Graphics buffer (reçu de Brain)
    this.currentGraphics = null;
  }

  preload() {
    // Charger le shader en preload (obligatoire pour WEBGL)
    this.shader = loadShader(
      'ressources/shaders/vert/main-v3.vert',
      'ressources/shaders/frag/shock.frag'
    );
  }

  init() {
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
    this.centres.push([x / width, y / height]);
    this.times.push(0);
    this.sizes.push(size);
  }

  // Détecter la vitesse de la souris et générer des ondes
  handleMouseSpeed() {
    let deltaX = mouseX - this.previousMouseX;
    let deltaY = mouseY - this.previousMouseY;
    let mouseSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (mouseSpeed > this.mouseSpeedThreshold && millis() - this.lastWaveTime > this.waveDelay) {
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

      this.generateShockwave(mouseX, mouseY, waveSize);
      this.lastWaveTime = millis();
    }

    this.previousMouseX = mouseX;
    this.previousMouseY = mouseY;
  }

  // Séquence d'animation de grandes shockwaves
  triggerBigShockwaveAnimation() {
    const shockwavePoints = [
      { x: width * 0.2, y: height * 0.3, size: 2.0 },
      { x: width * 0.8, y: height * 0.2, size: 1.8 },
      { x: width * 0.1, y: height * 0.7, size: 2.2 },
      { x: width * 0.9, y: height * 0.8, size: 1.9 },
      { x: width * 0.5, y: height * 0.1, size: 2.1 },
      { x: width * 0.4, y: height * 0.9, size: 2.0 },
    ];

    shockwavePoints.forEach((point, index) => {
      setTimeout(() => {
        this.generateShockwave(point.x, point.y, point.size);
      }, index * 100);
    });
  }

  // Commencer le rendu avec le buffer graphics
  beginRender(graphics) {
    if (!this.isInitialized) return;

    // Stocker le buffer graphics pour l'utiliser dans endRender()
    this.currentGraphics = graphics;

    this.handleMouseSpeed();
    this.currentGraphics.background(244, 243, 241);
    clear();
  }

  // Finaliser le rendu avec le shader
  endRender() {
    if (!this.isInitialized || !this.currentGraphics) return;

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

    // S'assurer qu'aucun autre shader n'est actif
    resetShader();

    shader(this.shader);
    this.shader.setUniform("centres", centresUniform);
    this.shader.setUniform("times", timesUniform);
    this.shader.setUniform("sizes", sizesUniform);
    this.shader.setUniform("image", this.currentGraphics);
    this.shader.setUniform("aspect", [1, width/height]);

    rect(-width/2, -height/2, width, height);

    // Reset shader après utilisation
    resetShader();
  }

}