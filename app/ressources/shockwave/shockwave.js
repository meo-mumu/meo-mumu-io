class Shockwave {
  constructor() {
    this.shader = loadShader('ressources/shaders/vert/main-v3.vert', 'ressources/shaders/frag/shock.frag');
    
    this.isAppear = false;
    this.isErasing = false;

    this.apparitionDuration = 2000; // Durée totale de l'apparition en ms
    this.apparitionTime = 0; // Temps écoulé depuis le début de l'apparition

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
    this.shader.setUniform("apparitionTime", this.apparitionTime);
    
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

  // ------------------------------------------------------------------------------------- Effects spirals

  async appearEffect() {
    this.isAppear = true;
    this.apparitionTime = 0;
    const start = performance.now();
    const spiralPromise = this.triggerSomeSpirals();

    while (this.apparitionTime < 1.0) {
      const now = performance.now();
      const elapsed = now - start;
      this.apparitionTime = Math.min(elapsed / this.apparitionDuration, 1.0);
      await new Promise(requestAnimationFrame);
    }
    await spiralPromise;

    this.isAppear = false;
    this.apparitionTime = 1.0;
    console.log('Appear effect done ' + this.isAppear);
  }

  async hideEffect() {
    await sleep(1000);
    console.log('test hide effect');
  }

  async triggerSomeSpirals() {
    let options = null;
    // spiral from center  0
    options = {pointsPerTurn: 3, minRadius: 0.05, maxRadius: Math.sqrt(2) / 16, delay: 80, reverse: false, angleOffset: 0};
    this.launchOneSpiral(options);
    // spiral from center  PI/2
    options = {pointsPerTurn: 3, minRadius: 0.05, maxRadius: Math.sqrt(2) / 13, delay: 90, reverse: false, angleOffset: Math.PI / 2 };
    this.launchOneSpiral(options);
    // spiral from center PI
    options = {pointsPerTurn: 3, minRadius: 0.05, maxRadius: Math.sqrt(2) / 17, delay: 100, reverse: false, angleOffset: Math.PI };
    this.launchOneSpiral(options);
    // spiral from center 3PI/2
    options = {pointsPerTurn: 3, minRadius: 0.05, maxRadius: Math.sqrt(2) / 14, delay: 110, reverse: false, angleOffset: 3 * Math.PI / 2 };
    this.launchOneSpiral(options);
  }

  async launchOneSpiral(options) {
    let centerX = 0.5;
    let centerY = 0.5;
    let turns = 2;
    let totalPoints = turns * options.pointsPerTurn;
    for (let i = 0; i < totalPoints; i++) {
      let t = options.reverse ? (totalPoints - 1 - i) / totalPoints : i / totalPoints;
      let angle = (i / options.pointsPerTurn) * TWO_PI + options.angleOffset;
      let radius = options.minRadius + t * (options.maxRadius - options.minRadius);
      let x = centerX + radius * Math.cos(angle);
      let y = centerY + radius * Math.sin(angle);
      let size = 0.5 + t * 0.7;
      this.generateShockwave(x * width, y * height, size);
      await sleep(options.delay + Math.random() * 170);
    }
  }

  // ------------------------------------------------------------------------------------- Utils

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

    // ------------------------------------------------------------------------------------- Tests

  async bubblingEffect() {
    this.isAppear = true;
    // let positions = [
    //   {x: 0.2, y: 0.8},
    //   {x: 0.8, y: 0.8},
    //   {x: 0.5, y: 0.5},
    //   {x: 0.2, y: 0.2},
    //   {x: 0.8, y: 0.2},
    // ];
    let positions = this.generateGridPositions(3, 3);
    for (let i = 0; i < positions.length; i++) {
      this.bubblingEffect(positions[i]);
      await sleep(10);
    }
    this.isAppear = false;
  }

  generateRandomPosition(n) {
    let positions = [];
    for (let i = 0; i < n; i++) {
      positions.push({
        x: Math.random(),
        y: Math.random()
      });
    }
    return positions;
  }

  generateGridPositions(rows, cols) {
    let positions = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        positions.push({
          x: (j + 0.5) / cols,
          y: (i + 0.5) / rows
        });
      }
    }
    return positions;
  }



  async bubblingEffect(pos) {
    let delay = 100;
    let bubblingDuration = 3000;

    for (let t = 0; t < bubblingDuration; t += delay) {
      await sleep(delay + Math.random() * 100);
      let stddev = 0.01; // Plus petit = plus concentré au centre
      let x = width * pos.x + this.gaussianRandom() * width * stddev;
      let y = height * pos.y + this.gaussianRandom() * height * stddev;
      let size = 0.6 + Math.random() * 0.5;
      this.generateShockwave(x, y, size);
      let apparitionTime = this.smoothstep(0, bubblingDuration, t);
      //console.log(apparitionTime);
      this.shader.setUniform("apparitionTime", apparitionTime);
    }
  }

}