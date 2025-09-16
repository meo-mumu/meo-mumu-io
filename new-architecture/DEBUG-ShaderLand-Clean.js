/**
 * SHADERLAND - VERSION CLEAN POUR DEBUG
 *
 * ⚠️ PROBLÈME PRINCIPAL ⚠️
 * Conflit WebGL entre deux shaders qui s'exécutent dans la même frame :
 * 1. Conway shader (ShaderLand) : Opère sur textures WebGL ping-pong
 * 2. Shockwave shader (Brain) : Appliqué sur canvas principal
 *
 * 🔥 SYMPTÔMES :
 * - Erreur console : "WebGL: INVALID_OPERATION: drawElements: no valid shader program in use"
 * - Clignotement bleu turquoise visible
 * - Shockwave ne fonctionne plus correctement quand Conway est actif
 *
 * 🧩 HYPOTHÈSE :
 * Le Conway shader laisse un état WebGL corrompu malgré resetShader(),
 * causant l'échec du Shockwave shader lors de p.rect()
 */

export class ShaderLand {
  constructor() {
    this.p = null;
    this.isActive = false;

    // Shader Conway
    this.conwayShader = null;

    // Textures WebGL pour ping-pong
    this.currentTexture = null;
    this.previousTexture = null;
    this.textureWidth = null;
    this.textureHeight = null;
  }

  preload(p) {
    console.log('🔧 [ShaderLand] preload() - Chargement shader Conway');
    this.conwayShader = p.loadShader(
      'ressources/shaders/vert/claudeConway.vert',
      'ressources/shaders/frag/claudeConway.frag'
    );
  }

  init(p) {
    console.log('🔧 [ShaderLand] init() - Création textures WebGL');
    this.p = p;

    this.textureWidth = p.width;
    this.textureHeight = p.height;

    // Créer 2 textures WebGL pour ping-pong
    this.currentTexture = p.createGraphics(this.textureWidth, this.textureHeight, p.WEBGL);
    this.previousTexture = p.createGraphics(this.textureWidth, this.textureHeight, p.WEBGL);

    // Initialiser avec fond brain.js
    this.currentTexture.background(244, 243, 241);
    this.previousTexture.background(244, 243, 241);
  }

  show() {
    console.log('🔧 [ShaderLand] show() - Activation');
    this.isActive = true;
  }

  hide() {
    console.log('🔧 [ShaderLand] hide() - Désactivation');
    this.isActive = false;
  }

  /**
   * APPELÉE PAR: onMousePressed() de Brain
   * OBJECTIF: Ajouter des cellules Conway au clic
   */
  onMousePressed() {
    if (!this.isActive || !this.currentTexture) return;

    console.log('🔧 [ShaderLand] onMousePressed() - Ajout cellules à:', this.p.mouseX, this.p.mouseY);

    // Dessiner des cellules rouges (canal R = état vivant) sur la texture
    this.currentTexture.fill(255, 0, 0);
    this.currentTexture.noStroke();

    let cellSize = 8;
    let webglX = this.p.mouseX - this.textureWidth / 2;
    let webglY = this.p.mouseY - this.textureHeight / 2;

    // Pattern 5x5 de cellules
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.random() > 0.3) {
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

  /**
   * ⚠️ FONCTION PROBLÉMATIQUE ⚠️
   *
   * RÔLE: Applique les règles de Conway via shader sur textures ping-pong
   * PROBLÈME: Corrompt l'état WebGL pour le shader Shockwave qui suit
   *
   * SÉQUENCE PROBLÉMATIQUE:
   * 1. this.currentTexture.shader(conwayShader)  ← Active Conway
   * 2. Rendu avec Conway shader
   * 3. this.currentTexture.resetShader()        ← Censé nettoyer
   * 4. [Plus tard] Brain applique shockwave     ← ÉCHEC ICI
   */
  updateConwayWithShader() {
    if (!this.isActive || !this.conwayShader) {
      console.log('🔧 [ShaderLand] updateConwayWithShader() - SKIPPED (inactive ou pas de shader)');
      return;
    }

    console.log('🔧 [ShaderLand] updateConwayWithShader() - DÉBUT');

    try {
      // ÉTAPE 1: Échanger les textures (ping-pong)
      [this.currentTexture, this.previousTexture] = [this.previousTexture, this.currentTexture];

      // ÉTAPE 2: Clear la texture courante
      this.currentTexture.clear();

      // ÉTAPE 3: ⚠️ PROBLÈME ICI ⚠️ - Application du shader
      console.log('🔧 [ShaderLand] Applying Conway shader...');
      this.currentTexture.shader(this.conwayShader);
      this.conwayShader.setUniform('previousGeneration', this.previousTexture);
      this.conwayShader.setUniform('resolution', [this.textureWidth, this.textureHeight]);

      // ÉTAPE 4: Dessiner avec le shader
      this.currentTexture.rect(
        -this.textureWidth/2,
        -this.textureHeight/2,
        this.textureWidth,
        this.textureHeight
      );

      // ÉTAPE 5: Reset shader
      this.currentTexture.resetShader();

      console.log('🔧 [ShaderLand] updateConwayWithShader() - SUCCÈS');

    } catch (error) {
      console.error('🔧 [ShaderLand] updateConwayWithShader() - ERREUR:', error);
      this.currentTexture.resetShader();
    }
  }

  /**
   * APPELÉE PAR: Brain.draw() via activePage.renderToGraphics()
   * OBJECTIF: Dessiner Conway sur le graphics buffer de Brain
   *
   * FLOW D'APPEL:
   * Brain.draw()
   *   → shockwave.beginRender()
   *   → activePage.renderToGraphics(shockwave.graphics) ← ICI
   *   → shockwave.endRender() (applique shader Shockwave)
   */
  renderToGraphics(graphics) {
    if (!this.isActive) {
      console.log('🔧 [ShaderLand] renderToGraphics() - SKIPPED (inactive)');
      return;
    }

    console.log('🔧 [ShaderLand] renderToGraphics() - DÉBUT');
    console.log('🔧 [ShaderLand] Graphics buffer type:', graphics.canvas ? '2D' : 'WebGL');

    // Mettre à jour Conway toutes les 15 frames
    if (this.p.frameCount % 15 === 0) {
      console.log('🔧 [ShaderLand] Frame', this.p.frameCount, '- Mise à jour Conway');
      this.updateConwayWithShader();
    }

    // ⚠️ CONFLIT POTENTIEL ICI ⚠️
    // Le graphics buffer de Shockwave est en 2D, pas WebGL
    // Dessiner notre texture WebGL sur le buffer 2D
    if (this.currentTexture) {
      console.log('🔧 [ShaderLand] Dessin texture sur graphics buffer');
      graphics.image(this.currentTexture, 0, 0);
    }

    console.log('🔧 [ShaderLand] renderToGraphics() - FIN');
  }

  /**
   * APPELÉE PAR: Brain.draw() via activePage.renderToCanvas() (fallback)
   * UTILISÉE SI: Pas de shaders disponibles
   */
  renderToCanvas(p) {
    if (!this.isActive) return;

    console.log('🔧 [ShaderLand] renderToCanvas() - FALLBACK');

    if (p.frameCount % 15 === 0) {
      this.updateConwayWithShader();
    }

    if (this.currentTexture) {
      p.image(this.currentTexture, 0, 0);
    }
  }

  update() {
    // Méthode de compatibilité - non utilisée
  }
}

/**
 * FLOW D'APPEL COMPLET:
 *
 * 1. INITIALISATION:
 *    Brain.init() → ShaderLand.preload() → ShaderLand.init()
 *
 * 2. ACTIVATION:
 *    MainPage.handleTextClick() → Brain.switchTo('shaderland') → ShaderLand.show()
 *
 * 3. RENDU (CHAQUE FRAME):
 *    Brain.draw()
 *      → shockwave.beginRender()
 *        → graphics.background() + graphics.clear()
 *      → ShaderLand.renderToGraphics(shockwave.graphics)
 *        → ShaderLand.updateConwayWithShader() ⚠️ PROBLÈME ICI
 *        → graphics.image(currentTexture)
 *      → shockwave.endRender()
 *        → p.shader(shockwaveShader) ⚠️ CONFLIT AVEC CONWAY SHADER
 *        → p.rect() avec shader Shockwave
 *
 * 4. INTERACTION:
 *    Brain.mousePressed() → ShaderLand.onMousePressed() → Ajout cellules
 *
 * HYPOTHÈSE SUR LE PROBLÈME:
 * - Conway shader laisse un état invalide sur les textures WebGL
 * - Quand Shockwave essaie d'utiliser son shader, l'état WebGL est corrompu
 * - Solution possible: Vérifier que resetShader() fonctionne correctement
 */