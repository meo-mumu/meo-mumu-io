class Shockwave {
  constructor() {
    this.shader = loadShader('ressources/shaders/vert/main-v3.vert', 'ressources/shaders/frag/shock.frag');
    this.isErasing = false;

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

    // Initialiser les shockwaves
    this.init();
  }

  init() {
    for(let i = 0; i < this.NUM_SHOCKWAVES; i++) {
      this.centres[i] = [0, 0];
      this.times[i] = 1;
      this.sizes[i] = 1.0;
    }
  }

  render(graphics) {
    this.handleMouseSpeed();

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

    shader(this.shader);
    this.shader.setUniform("centres", centresUniform);
    this.shader.setUniform("times", timesUniform);
    this.shader.setUniform("sizes", sizesUniform);
    this.shader.setUniform("image", graphics);
    this.shader.setUniform("aspect", [1, width/height]);

    // Nouveau uniform pour l'effacement
    let erasingValue = this.isErasing ? 1.0 : 0.0;
    if (erasingValue > 0.5) {
      console.log('⚡ Shader: isErasing =', erasingValue);
    }
    this.shader.setUniform("isErasing", erasingValue);

    rect(-width/2, -height/2, width, height);

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

  async triggerAppearingShockwave() {
    console.log('Début');
    await sleep(3000); // pause 3 secondes
    console.log('Après 3 secondes');
  }

  // Séquence d'animation de grandes shockwaves avec effacement
  async triggerBigShockwaveAnimation() {
    return new Promise((resolve) => {
      // Pattern horizontal pour effacement fluide de gauche à droite
      const shockwavePoints = [
        { x: width * 0.0, y: height * 0.0, size: 2.5 },
        { x: width * 0.0, y: height * 0.1, size: 2.5 },
        { x: width * 0.0, y: height * 0.3, size: 2.5 },
        { x: width * 0.0, y: height * 0.4, size: 2.2 },
        { x: width * 0.0, y: height * 0.5, size: 2.2 },
        { x: width * 0.0, y: height * 0.8, size: 100.2 },
      ];

      shockwavePoints.forEach((point, index) => {
        setTimeout(() => {
          // Activer l'effacement avec la première onde
          if (index === 0) {
            console.log('🔥 Shockwave: Activating isErasing with wave', index);
            this.isErasing = true;
          }
          console.log('🌊 Shockwave: Generating wave', index, 'at', point.x, point.y);
          this.generateShockwave(point.x, point.y, point.size);
        }, index * 100);
      });

      // Attendre la fin de l'animation
      setTimeout(() => {
        // Remettre en mode normal après un délai
        setTimeout(() => {
          this.isErasing = false;
          console.log('🌊 Shockwave: Animation completed, resolved Promise');
          resolve();
        }, 500);
      }, 1500); // Durée de l'animation + marge
    });
  }

    // Fonction utilitaire smoothstep
  smoothstep(edge0, edge1, x) {
    let t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

}