class Pokemon {
  constructor(char, font, width, height, frot_factor, color) {
    this.char = char;
    this.font = font;
    this.width = width;
    this.height = height;

    // aspect
    this.base_radius = random(15, 30);
    this.radius = this.base_radius;
    this.color = color;
    this.rotation = 0;

    // perlin offset pour la taille et rotation
    this.noise_offset_size = random(1000);
    this.noise_offset_rotation = random(1000);

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
    const border_margin = 100; // distance depuis le bord où la force commence
    const force_strength = 0.5; // intensité de la force

    // force depuis le bord gauche
    if (this.x < border_margin) {
      let force = map(this.x, 0, border_margin, force_strength, 0);
      this.ax += force;
    }
    // force depuis le bord droit
    if (this.x > width - border_margin) {
      let force = map(this.x, width - border_margin, width, 0, force_strength);
      this.ax -= force;
    }
    // force depuis le bord haut
    if (this.y < border_margin) {
      let force = map(this.y, 0, border_margin, force_strength, 0);
      this.ay += force;
    }
    // force depuis le bord bas
    if (this.y > height - border_margin) {
      let force = map(this.y, height - border_margin, height, 0, force_strength);
      this.ay -= force;
    }
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

  edge() {
    // wrapping en cas de dépassement extrême
    const margin = 50;
    if (this.x > width + margin) {
      this.x = -margin;
    } else if (this.x < -margin) {
      this.x = width + margin;
    }

    if (this.y > height + margin) {
      this.y = -margin;
    } else if (this.y < -margin) {
      this.y = height + margin;
    }
  }

  follow(perlin_grid, scl, cols, rows) {
    let x = Math.floor(this.x / scl);
    let y = Math.floor(this.y / scl);

    // clamp manuel plus rapide que constrain()
    if (x < 0) x = 0;
    else if (x >= cols) x = cols - 1;

    if (y < 0) y = 0;
    else if (y >= rows) y = rows - 1;

    // accès direct au vecteur (plus besoin de vérifier existence avec clamp)
    const force = perlin_grid[x][y];
    this.ax = force.x;
    this.ay = force.y;
  }

  update(rotation_speed, time, size_amplitude, pokemons, separation_force) {
    // séparation entre pokemon (skip si force = 0)
    if (separation_force > 0) {
      this.separate(pokemons, separation_force);
    }

    // appliquer force de bordure avant de calculer la vélocité
    this.apply_border_force();

    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= this.frot_factor;
    this.vy *= this.frot_factor;
    this.ax = 0;
    this.ay = 0;

    // wrapping
    this.edge();

    // une seule valeur de noise pour rotation ET taille (optimisation)
    let noiseValue = noise(this.noise_offset_rotation + time * 0.4);

    // rotation basée sur le noise
    this.rotation = (noiseValue - 0.5) * rotation_speed * Math.PI * 2;

    // variation de taille basée sur la même valeur (légèrement décalée)
    let size_variation = (noiseValue * 0.8 - 0.4) * size_amplitude;
    this.radius = this.base_radius * (1 + size_variation);
    // sécurité : taille minimale
    this.radius = max(this.radius, 5);
  }

  draw_pokemon() {
    graphic.push();
    graphic.translate(this.x, this.y);
    graphic.rotate(this.rotation);
    graphic.fill(this.color.r, this.color.g, this.color.b, 200);
    graphic.noStroke();
    graphic.textFont(this.font);
    graphic.textSize(this.radius);
    graphic.textAlign(graphic.CENTER, graphic.CENTER);
    graphic.text(this.char, 0, 0);
    graphic.pop();
  }

  is_on_screen(margin) {
    return this.x > -margin && this.x < width + margin &&
           this.y > -margin && this.y < height + margin;
  }

  draw_pokemon_optimized() {
    graphic.push();
    graphic.translate(this.x, this.y);
    graphic.rotate(this.rotation);
    graphic.fill(this.color.r, this.color.g, this.color.b, 200);
    graphic.textSize(this.radius);
    graphic.text(this.char, 0, 0);
    graphic.pop();
  }
}
