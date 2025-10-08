class ShaderLand {
  constructor() {
    // colors palette (inspired by salinity colormap)
    this.colors = this._generate_color_palette();

    // perlin grid parameters
    this.scl = 20;
    this.inc_x = 0.03;
    this.inc_y = 0.03;
    this.inc_z = 0.005;
    this.rotation_globale = 0;
    this.rotation_pokemon = 0;
    this.size_amplitude = 10;
    this.perlin_grid = [];
    this.zoff = 0;

    // pokemon data
    this.pokemons = [];
    this.num_pokemons = 186;
    this.frot_factor = 0.1;
    this.separation_force = 50;
    this._build_pokemons();

    // grille spatiale pour optimisation
    this.spatial_grid = {};
    this.spatial_cell_size = 100;

    // object pooling pour éviter allocations
    this.nearby_pool = [];

    // fps monitoring
    this.fps = 0;

    // time
    this.time = 0;

    // tweakpane
    this.pane = new Tweakpane.Pane();
    this.pane.element.style.display = 'none'; // caché par défaut
    this._create_pane();
  }

  _generate_color_palette() {
    let palette = [];
    let num_colors = 100;

    for (let i = 0; i < num_colors; i++) {
      let t = i / num_colors;
      // gradient bleu foncé -> cyan -> vert clair (salinity style)
      let r = Math.floor(lerp(20, 150, t));
      let g = Math.floor(lerp(50, 220, t));
      let b = Math.floor(lerp(100, 180, t));
      palette.push({ r, g, b });
    }

    return palette;
  }

  _build_pokemons() {
    const pokemon_fonts = [fonts.pokpix1, fonts.pokpix2, fonts.pokpix3];

    const excluded_codes = [44, 45, 46, 47];
    for (let i = 33; i <= 43; i++) excluded_codes.push(i);
    for (let i = 58; i <= 64; i++) excluded_codes.push(i);
    for (let i = 91; i <= 96; i++) excluded_codes.push(i);
    for (let i = 123; i <= 126; i++) excluded_codes.push(i);

    for (let font of pokemon_fonts) {
      for (let char_code = 33; char_code <= 126; char_code++) {
        if (!excluded_codes.includes(char_code)) {
          let random_color = random(this.colors);
          let pokemon = new Pokemon(
            String.fromCharCode(char_code),
            font,
            width,
            height,
            this.frot_factor,
            random_color
          );
          this.pokemons.push(pokemon);
        }
      }
    }
  }

  _build_spatial_grid() {
    this.spatial_grid = {};
    const cell_size = this.spatial_cell_size;

    for (let pokemon of this.pokemons) {
      const cell_x = Math.floor(pokemon.x / cell_size);
      const cell_y = Math.floor(pokemon.y / cell_size);
      const key = `${cell_x},${cell_y}`;

      if (!this.spatial_grid[key]) {
        this.spatial_grid[key] = [];
      }
      this.spatial_grid[key].push(pokemon);
    }
  }

  _get_nearby_pokemons(pokemon) {
    const cell_size = this.spatial_cell_size;
    const cell_x = Math.floor(pokemon.x / cell_size);
    const cell_y = Math.floor(pokemon.y / cell_size);

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

  init_perlin_grid(cols, rows) {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        // normaliser noise de [0,1] vers [-1,1] comme dans l'exemple
        let n = noise(xoff, yoff, this.zoff) * 2 - 1;
        // create a vector from noise avec rotation globale
        const angle = n * Math.PI + this.rotation_globale;
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

  _create_pane() {
    this.pane.addMonitor(this, 'fps', { label: 'FPS' });

    let folder = this.pane.addFolder({ title: 'Perlin Flow' });
    folder.addInput(this, 'scl', { min: 10, max: 100, step: 1 });
    folder.addInput(this, 'frot_factor', { min: 0.01, max: 1, label: 'frottement' });
    folder.addInput(this, 'separation_force', { min: 0, max: 100, step: 2, label: 'séparation' });
    folder.addInput(this, 'rotation_globale', { min: 0, max: Math.PI * 2, step: 0.01, label: 'rotation globale' });
    folder.addInput(this, 'rotation_pokemon', { min: 0, max: 10, step: 0.1, label: 'rotation pokemon' });
    folder.addInput(this, 'size_amplitude', { min: 0, max: 20, step: 1, label: 'size amplitude' });
    folder.addInput(this, 'inc_x', { min: 0.01, max: 0.5 });
    folder.addInput(this, 'inc_y', { min: 0.01, max: 0.5 });
    folder.addInput(this, 'inc_z', { min: 0.001, max: 0.01 });
  }

  async appear() {
    console.log('Shaderland appear');
    if (this.pane) {
      this.pane.element.style.display = 'block';
    }
  }

  async hide() {
    console.log('Shaderland hide');
    if (this.pane) {
      this.pane.element.style.display = 'none';
    }
  }

  render() {
    // update fps
    this.fps = Math.round(frameRate());

    // increment time
    this.time += 0.01;

    // graphic.clear();
    // graphic.background(244, 243, 241);

    // init perlin grid
    const scl = this.scl;
    const cols = Math.floor(width / scl);
    const rows = Math.floor(height / scl);
    this.init_perlin_grid(cols, rows);

    // cache variables
    const rotation_pokemon = this.rotation_pokemon;
    const time = this.time;
    const size_amplitude = this.size_amplitude;
    const separation_force = this.separation_force;
    const perlin_grid = this.perlin_grid;
    const pokemons = this.pokemons;
    const pokemons_length = pokemons.length;

    // update pokemons
    if (separation_force > 0) {
      // avec séparation - construire grille spatiale
      this._build_spatial_grid();
      for (let i = 0; i < pokemons_length; i++) {
        let pokemon = pokemons[i];
        pokemon.follow(perlin_grid, scl, cols, rows);
        let nearby = this._get_nearby_pokemons(pokemon);
        pokemon.update(rotation_pokemon, time, size_amplitude, nearby, separation_force);
      }
    } else {
      // sans séparation - skip grille spatiale
      for (let i = 0; i < pokemons_length; i++) {
        let pokemon = pokemons[i];
        pokemon.follow(perlin_grid, scl, cols, rows);
        pokemon.update(rotation_pokemon, time, size_amplitude, [], 0);
      }
    }

    // draw pokemons - regrouper par font + frustum culling
    graphic.textAlign(graphic.CENTER, graphic.CENTER);
    graphic.noStroke();
    const screen_margin = 100;

    for (let font_key of ['pokpix1', 'pokpix2', 'pokpix3']) {
      const current_font = fonts[font_key];
      graphic.textFont(current_font);
      for (let i = 0; i < pokemons_length; i++) {
        let pokemon = pokemons[i];
        if (pokemon.font === current_font && pokemon.is_on_screen(screen_margin)) {
          pokemon.draw_pokemon_optimized();
        }
      }
    }
  }

  onMousePressed() {

}
}