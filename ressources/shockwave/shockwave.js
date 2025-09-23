class Shockwave {
  constructor() {
    this.shader = loadShader('ressources/shaders/vert/main-v3.vert', 'ressources/shaders/frag/shock.frag');
    
    this.isAppear = false;
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

  render() {
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
    this.shader.setUniform("image", graphic);
    this.shader.setUniform("backgroundImage", backgroundGraphic);
    this.shader.setUniform("aspect", [1, width/height]);
    
    // Uniforms pour l'apparition
    let appearingValue = this.isAppear ? 1.0 : 0.0;
    this.shader.setUniform("isAppear", appearingValue);
    
    // Uniforms pour l'effacement
    let erasingValue = this.isErasing ? 1.0 : 0.0;
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

  async apparitionMainPage() {
    this.isAppear = true;
    let delay = 90;
    let apparitionDuration = 3000;

    for (let t = 0; t < apparitionDuration; t += delay) {
      // Génère des positions centrées (écart-type ajustable)
      let stddev = 0.06; // Plus petit = plus concentré au centre
      let x = width / 2 + this.gaussianRandom() * width * stddev;
      let y = height / 2 + this.gaussianRandom() * height * stddev;
      let size = 0.6 + Math.random() * 0.5;
      this.generateShockwave(x, y, size);
      await sleep(delay);
      let appearingTime = this.smoothstep(0, apparitionDuration, t);
      //console.log(appearingTime);
      this.shader.setUniform("appearingTime", appearingTime);
    }
    this.isAppear = false;
  }


    // Fonction utilitaire smoothstep
  smoothstep(edge0, edge1, x) {
    let t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  gaussianRandom() {
    // Box-Muller transform, moyenne 0, écart-type 1
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

}