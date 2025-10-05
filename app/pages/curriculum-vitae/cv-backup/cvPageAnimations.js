/**
 * Animation et effets pour CvPageP5
 */
class CvPageAnimations {
  constructor(cvPage) {
    this.cvPage = cvPage;
  }

  startEmergenceAnimation() {
    this.cvPage.emergenceState.isAnimating = true;
    this.cvPage.emergenceState.progress = 0;
    this.cvPage.emergenceState.barWidth = 0;
    this.cvPage.emergenceState.barHeight = 0;
    this.cvPage.emergenceState.contentOpacity = 0;
    this.cvPage.emergenceState.shadowIntensity = 0;

    const totalDuration = 2500;
    const phase1Duration = 1000; // barre horizontale
    const phase2Duration = 1500; // ouverture verticale + apparition du contenu simultanée

    const startTime = Date.now();
    const frameRate = 60;
    const frameInterval = 1000 / frameRate;

    console.log('Starting emergence animation - total duration:', totalDuration, 'ms');

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const globalProgress = Math.min(elapsed / totalDuration, 1.0);

      // -------------------------------------------- phase 1 : barre horizontale du centre vers exterieur
      if (elapsed < phase1Duration) {
        const phase1Progress = elapsed / phase1Duration;
        const eased = 1 - Math.pow(1 - phase1Progress, 3); // ease-out

        const layout = this.cvPage.calculateLayout();
        this.cvPage.emergenceState.barWidth = eased * layout.container.width;
        this.cvPage.emergenceState.barHeight = 4; // petite barre fine
        this.cvPage.emergenceState.contentOpacity = 0;
        this.cvPage.emergenceState.shadowIntensity = eased * 0.3;
      }
      // -------------------------------------------- phase 2 : ouverture verticale + apparition contenu simultanée
      else {
        const phase2Elapsed = elapsed - phase1Duration;
        const phase2Progress = phase2Elapsed / phase2Duration;
        const eased = 1 - Math.pow(1 - phase2Progress, 4); // ease-out très doux

        const layout = this.cvPage.calculateLayout();
        this.cvPage.emergenceState.barWidth = layout.container.width;
        this.cvPage.emergenceState.barHeight = eased * layout.container.height;
        this.cvPage.emergenceState.contentOpacity = eased; // le contenu apparait en même temps que l'ouverture
        this.cvPage.emergenceState.shadowIntensity = 0.3 + eased * 0.7;
      }

      this.cvPage.emergenceState.progress = globalProgress;
      this.cvPage.emergenceState.neomorphicStyle = 'raised';

      if (globalProgress < 1) {
        setTimeout(animate, frameInterval);
      } else {
        this.cvPage.emergenceState.isAnimating = false;
        this.cvPage.emergenceState.shadowIntensity = 1;
        this.cvPage.emergenceState.contentOpacity = 1;
        console.log('Emergence animation completed');
      }
    };

    animate();
  }

  // Méthodes d'application des shadows avec animation
  applyShadowWithConfig(shadowConfig, drawFunction) {
    graphic.drawingContext.save();
    graphic.drawingContext.shadowColor = `rgba(${this.cvPage.COLORS.SHADOW.join(', ')})`;
    graphic.drawingContext.shadowBlur = shadowConfig.blur;
    graphic.drawingContext.shadowOffsetX = shadowConfig.offsetX;
    graphic.drawingContext.shadowOffsetY = shadowConfig.offsetY;

    drawFunction();

    graphic.drawingContext.restore();
  }

  applyShadow(drawFunction) {
    this.applyShadowWithConfig(this.cvPage.SHADOW_CONFIG.NORMAL, drawFunction);
  }

  applyLightShadow(drawFunction) {
    this.applyShadowWithConfig(this.cvPage.SHADOW_CONFIG.LIGHT, drawFunction);
  }

  applyAnimatedShadow(drawFunction) {
    const intensity = this.cvPage.emergenceState.shadowIntensity;
    const animatedConfig = {
      blur: this.cvPage.SHADOW_CONFIG.NORMAL.blur * intensity,
      offsetX: this.cvPage.SHADOW_CONFIG.NORMAL.offsetX * intensity,
      offsetY: this.cvPage.SHADOW_CONFIG.NORMAL.offsetY * intensity
    };
    this.applyShadowWithConfig(animatedConfig, drawFunction);
  }

  applyRadialRevealMask(x, y, width, height) {
    graphic.drawingContext.save();
    graphic.drawingContext.beginPath();

    // Centre du container
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Rayon maximum pour couvrir tout le container (diagonal)
    const maxRadius = Math.sqrt(width * width + height * height) / 2;

    // Rayon actuel basé sur le progress de l'animation
    const currentRadius = this.cvPage.emergenceState.revealRadius * maxRadius;

    // Créer un masque circulaire
    graphic.drawingContext.arc(centerX, centerY, currentRadius, 0, TWO_PI);
    graphic.drawingContext.clip();
  }
}