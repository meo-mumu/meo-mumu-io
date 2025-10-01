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
    this.cvPage.emergenceState.shadowIntensity = 0; // Commencer à 0

    const duration = 8000; // 8 secondes
    const startTime = Date.now();
    const frameRate = 60;
    const frameInterval = 1000 / frameRate;

    console.log('Starting emergence animation - duration:', duration, 'ms');

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      console.log('Animation progress:', Math.floor(progress * 100) + '%', 'elapsed:', elapsed + 'ms');

      // Courbe ease-out plus douce pour un fade progressif
      const eased = 1 - Math.pow(1 - progress, 4);

      this.cvPage.emergenceState.progress = eased;
      this.cvPage.emergenceState.scale = lerp(0.99, 1.0, eased);

      // Animation des shadows : fade très progressif
      const shadowProgress = Math.pow(progress, 3);
      this.cvPage.emergenceState.shadowIntensity = shadowProgress;

      // Transition du style : inset au début, raised à la fin
      this.cvPage.emergenceState.neomorphicStyle = eased > 0.6 ? 'raised' : 'inset';

      if (progress < 1) {
        setTimeout(animate, frameInterval);
      } else {
        this.cvPage.emergenceState.isAnimating = false;
        this.cvPage.emergenceState.neomorphicStyle = 'raised';
        this.cvPage.emergenceState.shadowIntensity = 1;
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