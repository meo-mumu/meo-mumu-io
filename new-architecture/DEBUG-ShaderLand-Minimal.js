/**
 * SHADERLAND - VERSION MINIMALE POUR TESTS D'ISOLATION
 *
 * Cette version permet d'activer/désactiver sélectivement :
 * - Conway shader
 * - Shockwave interaction
 * - Différents modes de rendu
 *
 * Pour tester, modifier les flags DEBUG_* ci-dessous
 */

// 🧪 FLAGS DE DEBUG - MODIFIER CES VALEURS POUR TESTER
const DEBUG_ENABLE_CONWAY_SHADER = true;   // false = pas de shader Conway
const DEBUG_ENABLE_SHOCKWAVE_COMPAT = true; // false = pas d'interaction avec Shockwave
const DEBUG_FRAME_ALTERNATING = false;     // true = Conway et Shockwave sur frames alternées
const DEBUG_VERBOSE_LOGGING = true;        // true = logs détaillés

export class ShaderLand {
  constructor() {
    this.p = null;
    this.isActive = false;
    this.conwayShader = null;
    this.currentTexture = null;
    this.previousTexture = null;
    this.textureWidth = null;
    this.textureHeight = null;

    if (DEBUG_VERBOSE_LOGGING) {
      console.log('🧪 [DEBUG] ShaderLand créé avec flags:', {
        conwayShader: DEBUG_ENABLE_CONWAY_SHADER,
        shockwaveCompat: DEBUG_ENABLE_SHOCKWAVE_COMPAT,
        frameAlternating: DEBUG_FRAME_ALTERNATING
      });
    }
  }

  preload(p) {
    if (DEBUG_ENABLE_CONWAY_SHADER) {
      console.log('🧪 [DEBUG] Chargement shader Conway...');
      this.conwayShader = p.loadShader(
        'ressources/shaders/vert/claudeConway.vert',
        'ressources/shaders/frag/claudeConway.frag'
      );
    } else {
      console.log('🧪 [DEBUG] SKIP chargement shader Conway (flag désactivé)');
    }
  }

  init(p) {
    this.p = p;
    this.textureWidth = p.width;
    this.textureHeight = p.height;

    // Créer textures seulement si shader activé
    if (DEBUG_ENABLE_CONWAY_SHADER) {
      console.log('🧪 [DEBUG] Création textures WebGL...');
      this.currentTexture = p.createGraphics(this.textureWidth, this.textureHeight, p.WEBGL);
      this.previousTexture = p.createGraphics(this.textureWidth, this.textureHeight, p.WEBGL);
      this.currentTexture.background(244, 243, 241);
      this.previousTexture.background(244, 243, 241);
    } else {
      console.log('🧪 [DEBUG] SKIP création textures (shader désactivé)');
    }
  }

  show() {
    this.isActive = true;
    console.log('🧪 [DEBUG] ShaderLand activé');
  }

  hide() {
    this.isActive = false;
    console.log('🧪 [DEBUG] ShaderLand désactivé');
  }

  onMousePressed() {
    if (!this.isActive) return;

    if (DEBUG_ENABLE_CONWAY_SHADER && this.currentTexture) {
      console.log('🧪 [DEBUG] Ajout cellules Conway...');

      this.currentTexture.fill(255, 0, 0);
      this.currentTexture.noStroke();

      let cellSize = 8;
      let webglX = this.p.mouseX - this.textureWidth / 2;
      let webglY = this.p.mouseY - this.textureHeight / 2;

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
    } else {
      console.log('🧪 [DEBUG] SKIP ajout cellules (pas de shader ou texture)');
    }
  }

  updateConwayWithShader() {
    // Vérifications basiques
    if (!this.isActive || !DEBUG_ENABLE_CONWAY_SHADER || !this.conwayShader) {
      if (DEBUG_VERBOSE_LOGGING) {
        console.log('🧪 [DEBUG] SKIP updateConway:', {
          active: this.isActive,
          shaderFlag: DEBUG_ENABLE_CONWAY_SHADER,
          hasShader: !!this.conwayShader
        });
      }
      return;
    }

    // Test frame alternée
    if (DEBUG_FRAME_ALTERNATING && this.p.frameCount % 2 !== 0) {
      if (DEBUG_VERBOSE_LOGGING) {
        console.log('🧪 [DEBUG] SKIP Conway (frame impaire, alternating mode)');
      }
      return;
    }

    console.log('🧪 [DEBUG] === DÉBUT Conway shader ===');

    try {
      // Logger état WebGL AVANT
      if (DEBUG_VERBOSE_LOGGING) {
        let gl = this.p._renderer.GL;
        console.log('🧪 [DEBUG] WebGL state AVANT Conway:', {
          error: gl.getError(),
          currentProgram: gl.getParameter(gl.CURRENT_PROGRAM)
        });
      }

      // Ping-pong
      [this.currentTexture, this.previousTexture] = [this.previousTexture, this.currentTexture];
      this.currentTexture.clear();

      // Application shader
      console.log('🧪 [DEBUG] Application Conway shader...');
      this.currentTexture.shader(this.conwayShader);
      this.conwayShader.setUniform('previousGeneration', this.previousTexture);
      this.conwayShader.setUniform('resolution', [this.textureWidth, this.textureHeight]);

      this.currentTexture.rect(
        -this.textureWidth/2,
        -this.textureHeight/2,
        this.textureWidth,
        this.textureHeight
      );

      // Reset shader
      this.currentTexture.resetShader();
      console.log('🧪 [DEBUG] Conway shader reset');

      // Logger état WebGL APRÈS
      if (DEBUG_VERBOSE_LOGGING) {
        let gl = this.p._renderer.GL;
        console.log('🧪 [DEBUG] WebGL state APRÈS Conway:', {
          error: gl.getError(),
          currentProgram: gl.getParameter(gl.CURRENT_PROGRAM)
        });
      }

      console.log('🧪 [DEBUG] === FIN Conway shader (SUCCÈS) ===');

    } catch (error) {
      console.error('🧪 [DEBUG] ERREUR Conway shader:', error);
      this.currentTexture.resetShader();
    }
  }

  renderToGraphics(graphics) {
    if (!this.isActive) return;

    console.log('🧪 [DEBUG] === DÉBUT renderToGraphics ===');

    // Mode compatibilité Shockwave ou pas
    if (!DEBUG_ENABLE_SHOCKWAVE_COMPAT) {
      console.log('🧪 [DEBUG] Mode sans Shockwave - rendu direct');
      // Rendu direct sans interaction avec Brain/Shockwave
      if (this.p.frameCount % 15 === 0) {
        this.updateConwayWithShader();
      }
      if (this.currentTexture) {
        this.p.image(this.currentTexture, 0, 0);
      }
      return;
    }

    // Mode normal avec Shockwave
    if (this.p.frameCount % 15 === 0) {
      console.log('🧪 [DEBUG] Frame', this.p.frameCount, '- Update Conway');
      this.updateConwayWithShader();
    }

    if (DEBUG_ENABLE_CONWAY_SHADER && this.currentTexture) {
      console.log('🧪 [DEBUG] Copie texture → graphics buffer');
      graphics.image(this.currentTexture, 0, 0);
    } else {
      console.log('🧪 [DEBUG] SKIP copie texture (pas de shader ou texture)');
    }

    console.log('🧪 [DEBUG] === FIN renderToGraphics ===');
  }

  renderToCanvas(p) {
    if (!this.isActive) return;

    console.log('🧪 [DEBUG] renderToCanvas (fallback)');

    if (this.p.frameCount % 15 === 0) {
      this.updateConwayWithShader();
    }

    if (this.currentTexture) {
      p.image(this.currentTexture, 0, 0);
    }
  }

  update() {
    // Compatibilité
  }
}

/**
 * 🧪 GUIDE D'UTILISATION POUR DEBUG:
 *
 * 1. TESTER SI CONWAY SEUL FONCTIONNE:
 *    - DEBUG_ENABLE_CONWAY_SHADER = true
 *    - DEBUG_ENABLE_SHOCKWAVE_COMPAT = false
 *    → Conway doit fonctionner sans erreur WebGL
 *
 * 2. TESTER SI SHOCKWAVE SEUL FONCTIONNE:
 *    - DEBUG_ENABLE_CONWAY_SHADER = false
 *    - DEBUG_ENABLE_SHOCKWAVE_COMPAT = true
 *    → Shockwave doit fonctionner sans erreur
 *
 * 3. TESTER ALTERNANCE DE FRAMES:
 *    - DEBUG_ENABLE_CONWAY_SHADER = true
 *    - DEBUG_ENABLE_SHOCKWAVE_COMPAT = true
 *    - DEBUG_FRAME_ALTERNATING = true
 *    → Conway sur frames paires, Shockwave sur toutes frames
 *
 * 4. ANALYSER LES LOGS:
 *    - DEBUG_VERBOSE_LOGGING = true
 *    → Voir état WebGL avant/après chaque shader
 *
 * REMPLACER temporairement dans brain.js:
 * import { ShaderLand } from './DEBUG-ShaderLand-Minimal.js';
 */