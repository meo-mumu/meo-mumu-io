class Particle extends Creatures {
  // Particle-specific count settings
  static getCreatureSettings() {
    return {
      defaultCount: 500,
      countMin: 1,
      countMax: 3000,
      countStep: 10,
      defaultSize: 1
    };
  }

  // Particle-specific UI controls configuration
  static getControlsConfig() {
    const baseConfig = super.getControlsConfig();
    return {
      creatures: {
        ...baseConfig.creatures,
        size: { min: 1, max: 100, step: 0.1, label: 'size' }
      }
    };
  }

  constructor(width, height, frot_factor, color) {
    // Call parent constructor with base_radius = 1 for Particle
    super(width, height, frot_factor, color, 1);
  }

  static createMany(num_objects, width, height, frot_factor, colors) {
    const particles = [];
    for (let i = 0; i < num_objects; i++) {
      let random_color = random(colors);
      let particle = new Particle(width, height, frot_factor, random_color);
      particles.push(particle);
    }
    return particles;
  }

  // Particle uses Creatures' update() method (no need to override)

  draw() {
    graphic.push();
    graphic.translate(this.x, this.y);
    graphic.fill(this.color.r, this.color.g, this.color.b, 200);
    graphic.noStroke();
    graphic.circle(0, 0, this.radius * 2);
    graphic.pop();
  }
}
