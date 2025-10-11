// Enum for creature types
const CreatureType = Object.freeze({
  POKEMON: 'pokemon',
  PARTICLE: 'particle'
});

class Creatures {
  // Creature count settings (default and limits)
  static getCreatureSettings() {
    return {
      defaultCount: 100,
      countMin: 10,
      countMax: 1000,
      countStep: 10
    };
  }

  // UI controls configuration available for this creature type
  static getControlsConfig() {
    return {
      creatures: {
        speed: { min: 0.1, max: 5, step: 0.1, label: 'speed' },
        size_amplitude: { min: 0, max: 20, step: 1, label: 'size amplitude' }
      }
    };
  }

  // Helper to map CreatureType enum to corresponding class
  static getClassForType(creatureType) {
    switch(creatureType) {
      case CreatureType.POKEMON:
        return Pokemon;
      case CreatureType.PARTICLE:
        return Particle;
      default:
        return Creatures;
    }
  }

  constructor(width, height, frot_factor, color, base_radius) {
    this.width = width;
    this.height = height;

    // aspect
    this.base_radius = base_radius;
    this.radius = this.base_radius;
    this.color = color;
    this.rotation = 0;

    // perlin offset pour la taille et rotation
    this.noise_offset = random(1000);

    // position
    this.x = random(0, width);
    this.y = random(0, height);

    // acceleration
    this.ax = 0;
    this.ay = 0;

    // velocity
    this.vx = 0;
    this.vy = 0;

    // frottement
    this.frot_factor = 1 - frot_factor;
  }

  apply_border_force() {
    const border_margin = 100;
    const force_strength = 0.5;

    // force depuis les bords
    if (this.x < border_margin) {
      let force = map(this.x, 0, border_margin, force_strength, 0);
      this.ax += force;
    }
    if (this.x > this.width - border_margin) {
      let force = map(this.x, this.width - border_margin, this.width, 0, force_strength);
      this.ax -= force;
    }
    if (this.y < border_margin) {
      let force = map(this.y, 0, border_margin, force_strength, 0);
      this.ay += force;
    }
    if (this.y > this.height - border_margin) {
      let force = map(this.y, this.height - border_margin, this.height, 0, force_strength);
      this.ay -= force;
    }
  }

  edge() {
    const margin = 50;
    if (this.x > this.width + margin) {
      this.x = -margin;
    } else if (this.x < -margin) {
      this.x = this.width + margin;
    }

    if (this.y > this.height + margin) {
      this.y = -margin;
    } else if (this.y < -margin) {
      this.y = this.height + margin;
    }
  }

  follow(perlin_grid, scl, cols, rows) {
    let x = Math.floor(this.x / scl);
    let y = Math.floor(this.y / scl);

    // clamp manuel
    if (x < 0) x = 0;
    else if (x >= cols) x = cols - 1;

    if (y < 0) y = 0;
    else if (y >= rows) y = rows - 1;

    // accès direct au vecteur
    const force = perlin_grid[x][y];
    this.ax = force.x;
    this.ay = force.y;
  }

  update(rotation_speed, time, size, size_amplitude, nearby = [], separation_force = 0, speed = 1) {
    // Base class doesn't use nearby and separation_force
    // Subclasses can use them if needed

    // Apply border force
    this.apply_border_force();

    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx * speed;
    this.y += this.vy * speed;
    this.vx *= this.frot_factor;
    this.vy *= this.frot_factor;
    this.ax = 0;
    this.ay = 0;

    // Wrapping
    this.edge();

    // Single noise value for rotation AND size (optimization)
    let noiseValue = noise(this.noise_offset + time * 0.4);

    // Rotation based on noise
    this.rotation = (noiseValue - 0.5) * rotation_speed * Math.PI * 2;

    // Size variation based on same value
    let size_variation = (noiseValue * 0.8 - 0.4) * size_amplitude;
    this.radius = this.base_radius * size * (1 + size_variation);
    this.radius = max(this.radius, 1);
  }

  is_on_screen(margin) {
    return this.x > -margin && this.x < this.width + margin &&
           this.y > -margin && this.y < this.height + margin;
  }

  // Méthode abstraite à implémenter par les sous-classes
  draw() {
    throw new Error('Method draw() must be implemented by subclass');
  }
}
