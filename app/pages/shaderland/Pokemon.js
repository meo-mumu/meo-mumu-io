class Pokemon extends Creatures {
  // Pokemon-specific count settings
  static getCreatureSettings() {
    return {
      defaultCount: 100,
      countMin: 0,
      countMax: 150,
      countStep: 10,
      defaultSize: 2
    };
  }

  // Pokemon-specific UI controls configuration
  static getControlsConfig() {
    const baseConfig = super.getControlsConfig();
    return {
      creatures: {
        ...baseConfig.creatures,
        size: { min: 1, max: 3, step: 0.1, label: 'size' },
        separation_force: { min: 0, max: 100, step: 2, label: 'repel force' },
        rotation_pokemon: { min: 0, max: 10, step: 0.1, label: 'rotation speed' }
      }
    };
  }

  constructor(char, font, width, height, frot_factor, color) {
    // Call parent constructor with random base_radius for Pokemon
    super(width, height, frot_factor, color, random(15, 30));

    // Pokemon-specific properties
    this.char = char;
    this.font = font;

    // Pokemon keeps its own offset for more variety
    this.noise_offset_rotation = random(1000);
  }

  static createMany(num_objects, width, height, frot_factor, colors, fonts) {
    const pokemon_fonts = [fonts.pokpix1, fonts.pokpix2, fonts.pokpix3];
    const pokemons = [];

    const excluded_codes = [44, 45, 46, 47];
    for (let i = 33; i <= 43; i++) excluded_codes.push(i);
    for (let i = 58; i <= 64; i++) excluded_codes.push(i);
    for (let i = 91; i <= 96; i++) excluded_codes.push(i);
    for (let i = 123; i <= 126; i++) excluded_codes.push(i);

    let count = 0;
    for (let font of pokemon_fonts) {
      for (let char_code = 33; char_code <= 126; char_code++) {
        if (!excluded_codes.includes(char_code) && count < num_objects) {
          let random_color = random(colors);
          let pokemon = new Pokemon(
            String.fromCharCode(char_code),
            font,
            width,
            height,
            frot_factor,
            random_color
          );
          pokemons.push(pokemon);
          count++;
        }
      }
      if (count >= num_objects) break;
    }

    return pokemons;
  }

  separate(nearby_pokemons, separation_force) {
    let count = 0;
    let steer_x = 0;
    let steer_y = 0;

    for (let other of nearby_pokemons) {
      if (other !== this) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let d_sq = dx * dx + dy * dy;

        // distance basée sur les radius des deux pokemon
        const desired_separation = (this.radius + other.radius) * 1.5;
        const desired_separation_sq = desired_separation * desired_separation;

        if (d_sq > 0 && d_sq < desired_separation_sq) {
          // utiliser distance au carré pour éviter sqrt
          let d = Math.sqrt(d_sq);
          let diff_x = dx / d;
          let diff_y = dy / d;
          diff_x = diff_x / d;
          diff_y = diff_y / d;

          steer_x += diff_x;
          steer_y += diff_y;
          count++;
        }
      }
    }

    if (count > 0) {
      steer_x = steer_x / count;
      steer_y = steer_y / count;
      this.ax += steer_x * separation_force;
      this.ay += steer_y * separation_force;
    }
  }

  update(rotation_speed, time, size, size_amplitude, nearby = [], separation_force = 0, speed = 1) {
    // Apply separation before the rest (Pokemon-specific behavior)
    if (separation_force > 0 && nearby.length > 0) {
      this.separate(nearby, separation_force);
    }

    // Call parent version for the rest of the behavior
    // Note: we use this.noise_offset_rotation instead of this.noise_offset
    // so we override just this part
    this.apply_border_force();

    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx * speed;
    this.y += this.vy * speed;
    this.vx *= this.frot_factor;
    this.vy *= this.frot_factor;
    this.ax = 0;
    this.ay = 0;

    this.edge();

    // Pokemon uses its own noise_offset for more variety
    let noiseValue = noise(this.noise_offset_rotation + time * 0.4);
    this.rotation = (noiseValue - 0.5) * rotation_speed * Math.PI * 2;
    let size_variation = (noiseValue * 0.8 - 0.4) * size_amplitude;
    this.radius = this.base_radius * size * (1 + size_variation);
    this.radius = max(this.radius, 5);
  }

  draw() {
    graphic.push();
    graphic.translate(this.x, this.y);
    graphic.rotate(this.rotation);
    graphic.fill(this.color.r, this.color.g, this.color.b, 200);
    graphic.textFont(this.font);
    graphic.textSize(this.radius);
    graphic.text(this.char, 0, 0);
    graphic.pop();
  }
}
