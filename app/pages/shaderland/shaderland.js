class ShaderLand {
  constructor() {
    // colors palette (inspired by salinity colormap)
    this.colors = this._generate_color_palette();

    // perlin grid parameters
    this.grid_scale = 50;
    this.inc_x = 0.01;
    this.inc_y = 0.01;
    this.inc_z = 0.005;
    this.global_rotation = 0;
    this.rotation_pokemon = 0;
    this.perlin_grid = [];
    this.zoff = 0;

    // creatures data
    this.creatureType = CreatureType.PARTICLE;
    this.creatures = [];
    this.num_creatures = Particle.getCreatureSettings().defaultCount;
    this.frot_factor = 0.1;
    this.separation_force = 20;
    this.speed = 1;
    this.size = Particle.getCreatureSettings().defaultSize;
    this.size_amplitude = 0;
    this._build_creatures();

    // clear screen
    this.clearScreen = false;

    // background mode
    this.backgroundMode = 'light'; // 'light' ou 'dark'

    // wave repel
    this.waveRepelRadius = 150;
    this.wave_repel_force = 10;
    this.prevMouseX = mouseX;
    this.prevMouseY = mouseY;

    // color control
    this.colorMode = 'static'; // 'static', 'rainbow', 'psychedelic'
    this.colorSpeed = 1;
    this.colorSaturation = 100;
    this.colorBrightness = 100;
    this.hueShift = 0;

    // grille spatiale pour optimisation
    this.spatial_grid = {};
    this.spatial_cell_size = 100;

    // object pooling pour éviter allocations
    this.nearby_pool = [];

    // fps monitoring
    this.fps = 0;

    // time
    this.time = 0;

    // controls (tweakpane)
    this.controls = new ShaderLandControls(this);
  }

  _generate_color_palette() {
    // Palette basée sur les BPM colors du projet soundscape
    let palette = [
      { r: 204, g: 255, b: 255 },  // #ccffff - cyan clair
      { r: 153, g: 255, b: 204 },  // #99ffcc - vert menthe
      { r: 255, g: 204, b: 204 },  // #ffcccc - rose clair
      { r: 204, g: 153, b: 255 },  // #cc99ff - violet clair
      { r: 102, g: 102, b: 255 },  // #6666ff - bleu vif
      { r: 51, g: 51, b: 153 }     // #333399 - bleu foncé
    ];

    return palette;
  }

  _build_creatures() {
    if (this.creatureType === CreatureType.POKEMON) {
      this.creatures = Pokemon.createMany(
        this.num_creatures,
        width,
        height,
        this.frot_factor,
        this.colors,
        fonts
      );
    } else if (this.creatureType === CreatureType.PARTICLE) {
      this.creatures = Particle.createMany(
        this.num_creatures,
        width,
        height,
        this.frot_factor,
        this.colors
      );
    }
  }

  _build_spatial_grid() {
    this.spatial_grid = {};
    const cell_size = this.spatial_cell_size;

    for (let creature of this.creatures) {
      const cell_x = Math.floor(creature.x / cell_size);
      const cell_y = Math.floor(creature.y / cell_size);
      const key = `${cell_x},${cell_y}`;

      if (!this.spatial_grid[key]) {
        this.spatial_grid[key] = [];
      }
      this.spatial_grid[key].push(creature);
    }
  }

  _get_nearby_creatures(creature) {
    const cell_size = this.spatial_cell_size;
    const cell_x = Math.floor(creature.x / cell_size);
    const cell_y = Math.floor(creature.y / cell_size);

    // réutiliser array pool
    this.nearby_pool.length = 0;

    // vérifier les 9 cellules (la cellule actuelle + les 8 voisines)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cell_x + dx},${cell_y + dy}`;
        if (this.spatial_grid[key]) {
          for (let p of this.spatial_grid[key]) {
            this.nearby_pool.push(p);
          }
        }
      }
    }

    return this.nearby_pool;
  }

  _applyWaveRepel(creature) {
    // Calculate distance between creature and mouse
    const dx = creature.x - mouseX;
    const dy = creature.y - mouseY;
    const distSq = dx * dx + dy * dy;
    const radiusSq = this.waveRepelRadius * this.waveRepelRadius;

    // If creature is within repel radius
    if (distSq < radiusSq && distSq > 0) {
      const dist = Math.sqrt(distSq);

      // Calculate mouse speed (reduced influence with sqrt)
      const mouseDx = mouseX - this.prevMouseX;
      const mouseDy = mouseY - this.prevMouseY;
      const mouseSpeed = Math.sqrt(Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy));

      // Force based on normalized distance and attenuated speed
      const distFactor = 1 - dist / this.waveRepelRadius;
      const force = this.wave_repel_force * distFactor * mouseSpeed * 0.1;

      // Normalized direction
      const nx = dx / dist;
      const ny = dy / dist;

      // Apply force in opposite direction from mouse
      creature.ax += nx * force;
      creature.ay += ny * force;
    }
  }

  _getCreatureColor(creature, index) {
    if (this.colorMode === 'static') {
      // Couleur d'origine avec hue shift
      const baseColor = creature.color;
      if (this.hueShift === 0 && this.colorSaturation === 100 && this.colorBrightness === 100) {
        return baseColor;
      }
      // Convert RGB to HSB, apply shifts, convert back
      colorMode(HSB);
      let c = color(baseColor.r, baseColor.g, baseColor.b);
      let h = (hue(c) + this.hueShift) % 360;
      let s = saturation(c) * (this.colorSaturation / 100);
      let b = brightness(c) * (this.colorBrightness / 100);
      let newColor = color(h, s, b);
      colorMode(RGB);
      return { r: red(newColor), g: green(newColor), b: blue(newColor) };
    } else if (this.colorMode === 'rainbow') {
      // Arc-en-ciel basé sur l'index et le temps
      colorMode(HSB);
      let hue = (index * 10 + this.time * this.colorSpeed * 50) % 360;
      let s = this.colorSaturation;
      let b = this.colorBrightness;
      let c = color(hue, s, b);
      colorMode(RGB);
      return { r: red(c), g: green(c), b: blue(c) };
    } else if (this.colorMode === 'psychedelic') {
      // Psychédélique basé sur position + temps + perlin noise
      colorMode(HSB);
      let noiseVal = noise(creature.x * 0.005, creature.y * 0.005, this.time * this.colorSpeed * 0.5);
      let hue = (noiseVal * 360 + this.time * this.colorSpeed * 100 + this.hueShift) % 360;
      let s = this.colorSaturation;
      let b = this.colorBrightness;
      let c = color(hue, s, b);
      colorMode(RGB);
      return { r: red(c), g: green(c), b: blue(c) };
    }
    return creature.color;
  }

  init_perlin_grid(cols, rows) {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        // normaliser noise de [0,1] vers [-1,1] comme dans l'exemple
        let n = noise(xoff, yoff, this.zoff) * 2 - 1;
        // create a vector from noise avec rotation globale
        const angle = n * Math.PI + this.global_rotation;
        let v = { x: Math.cos(angle), y: Math.sin(angle) };
        // save vector in perlin_grid
        if (!this.perlin_grid[x]) {
          this.perlin_grid[x] = [];
        }
        this.perlin_grid[x][y] = v;
        xoff += this.inc_x;
      }
      yoff += this.inc_y;
    }
    this.zoff += this.inc_z;
  }

  async appear() {
    console.log('Shaderland appear');
    // Initialiser le background au démarrage
    const bgColor = this.backgroundMode === 'light'
      ? [244, 243, 241]
      : [0, 0, 0];
    graphic.background(...bgColor);
    this.controls.show();
  }

  async hide() {
    console.log('Shaderland hide');
    this.controls.hide();
  }

  render() {
    // update fps
    this.fps = Math.round(frameRate());

    // increment time
    this.time += 0.01;

    // Clear ou pas (simple)
    if (this.clearScreen) {
      graphic.clear();
      const bgColor = this.backgroundMode === 'light'
        ? [244, 243, 241]
        : [0, 0, 0];
      graphic.background(...bgColor);
    }

    // init perlin grid
    const scl = this.grid_scale;
    const cols = Math.floor(width / scl);
    const rows = Math.floor(height / scl);
    this.init_perlin_grid(cols, rows);

    // cache variables
    const rotation_speed = this.rotation_pokemon;
    const time = this.time;
    const speed = this.speed;
    const size = this.size;
    const size_amplitude = this.size_amplitude;
    const separation_force = this.separation_force;
    const perlin_grid = this.perlin_grid;
    const creatures = this.creatures;
    const creatures_length = creatures.length;

    // update creatures (polymorphisme)
    if (separation_force > 0) {
      this._build_spatial_grid();
    }

    for (let i = 0; i < creatures_length; i++) {
      let creature = creatures[i];
      creature.follow(perlin_grid, scl, cols, rows);

      // Wave repel (enabled when force > 0)
      if (this.wave_repel_force > 0) {
        this._applyWaveRepel(creature);
      }

      // Pass nearby and separation_force to all creatures
      // Creatures that don't need them will ignore them
      let nearby = separation_force > 0 ? this._get_nearby_creatures(creature) : [];
      creature.update(rotation_speed, time, size, size_amplitude, nearby, separation_force, speed);
    }

    // Update previous mouse position
    this.prevMouseX = mouseX;
    this.prevMouseY = mouseY;

    // draw creatures (polymorphisme pur)
    graphic.noStroke();
    graphic.textAlign(graphic.CENTER, graphic.CENTER);
    const screen_margin = 100;

    for (let i = 0; i < creatures_length; i++) {
      let creature = creatures[i];
      if (creature.is_on_screen(screen_margin)) {
        // Appliquer la couleur dynamique
        const originalColor = creature.color;
        creature.color = this._getCreatureColor(creature, i);
        creature.draw(); // Polymorphisme
        creature.color = originalColor; // Restaurer la couleur d'origine
      }
    }
  }

  onMousePressed() {

}
}