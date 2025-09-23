/**
 * ShaderLand - Page pour les expérimentations shader
 * Automates cellulaires Conway créés au clic + shockwaves (rendu direct sur graphics)
 */

class ShaderLand {
  constructor() {
    this.isActive = false;
    this.conwayShader = null;
    this.currentTexture = null;
    this.previousTexture = null;
    this.conwayWidth = null;
    this.conwayHeight = null;
  }

  preload() {
    // Charger le shader Conway personnalisé
    this.conwayShader = loadShader(
      'ressources/shaders/vert/claudeConway.vert',
      'ressources/shaders/frag/claudeConway.frag'
    );
  }

  init() {
    // Initialiser les textures ping-pong pour Conway
    this.conwayWidth = width;
    this.conwayHeight = height;
    this.currentTexture = createGraphics(this.conwayWidth, this.conwayHeight, WEBGL);
    this.previousTexture = createGraphics(this.conwayWidth, this.conwayHeight, WEBGL);

    // Initialiser avec fond brain.js
    this.currentTexture.background(244, 243, 241);
    this.previousTexture.background(244, 243, 241);

    console.log('🎨 ShaderLand initialized with Conway shader');
  }

  createEmptyGrid() {
    let grid = [];
    for (let x = 0; x < this.gridWidth; x++) {
      grid[x] = [];
      for (let y = 0; y < this.gridHeight; y++) {
        grid[x][y] = false;
      }
    }
    return grid;
  }

  show() {
    this.isActive = true;
    console.log('🎨 ShaderLand shown');
  }

  hide() {
    this.isActive = false;
    console.log('🎨 ShaderLand hidden');
  }

  addConwayCell(x, y) {
    if (!this.currentTexture) return;

    // Dessiner des cellules sur la texture (sans shader)
    this.currentTexture.fill(255, 0, 0); // Rouge dans le canal R
    this.currentTexture.noStroke();

    // Créer un petit pattern de cellules autour du clic
    let cellSize = 8;
    let webglX = x - this.conwayWidth / 2;
    let webglY = y - this.conwayHeight / 2;

    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.random() > 0.3) { // 70% de chance
          this.currentTexture.rect(
            webglX + i * cellSize,
            webglY + j * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }

  updateConwayShader() {
    if (!this.isActive || !this.conwayShader) return;

    // Échanger les textures ping-pong (WebGL)
    [this.currentTexture, this.previousTexture] = [this.previousTexture, this.currentTexture];

    // Appliquer le shader Conway sur la texture WebGL courante
    this.currentTexture.clear();
    this.currentTexture.shader(this.conwayShader);
    this.conwayShader.setUniform('previousGeneration', this.previousTexture);
    this.conwayShader.setUniform('resolution', [this.conwayWidth, this.conwayHeight]);

    // Dessiner un rectangle plein écran avec le shader (coordonnées WebGL)
    this.currentTexture.rect(-this.conwayWidth/2, -this.conwayHeight/2, this.conwayWidth, this.conwayHeight);

    // Reset shader après utilisation
    this.currentTexture.resetShader();
  }

  renderToGraphics(graphics) {
    if (!this.isActive) return;

    // Mettre à jour Conway avec shader toutes les 15 frames
    if (frameCount % 15 === 0) {
      this.updateConwayShader();
    }

    // Dessiner le résultat sur le graphics 2D (sans shader)
    if (this.currentTexture) {
      graphics.image(this.currentTexture, 0, 0);
    }
  }

  renderToCanvas() {
    if (!this.isActive) return;

    // Version fallback - même principe que renderToGraphics
    if (frameCount % 15 === 0) {
      this.updateConwayShader();
    }

    if (this.currentTexture) {
      image(this.currentTexture, 0, 0);
    }
  }

  // Méthode de compatibilité
  update() {
    // Cette méthode n'est plus utilisée mais gardée pour compatibilité
  }

  onMousePressed() {
    if (!this.isActive) return;

    // Créer des cellules Conway au clic
    this.addConwayCell(mouseX, mouseY);
    console.log('🧬 Conway cells added at', this.p.mouseX, this.p.mouseY);
  }
}