/**
 * Animation et effets pour CvPageP5
 */
class CvPageAnimations {
  constructor(cvPage) {
    this.cvPage = cvPage;
    this.initMysticalFonts();
  }

  // -------------------------------------------- mystical fonts setup

  initMysticalFonts() {
    this.mysticalFonts = [
      fonts.highschoolRunes,
      fonts.graceOfEtro,
      fonts.ancientModern
    ];
    this.finalFont = fonts.segoeUI; // police finale pour tout le texte
  }

  // -------------------------------------------- animation glitch

  startEmergenceAnimation() {
    this.cvPage.emergenceState.isAnimating = true;
    this.cvPage.emergenceState.typingProgress = 0;
    this.cvPage.emergenceState.charFontIndices.clear();
    this.cvPage.emergenceState.charNoiseOffsets.clear();
    this.cvPage.emergenceState.shadowIntensity = 0;

    const totalDuration = 3000;
    const startTime = Date.now();

    console.log('Starting herald-style typing animation - duration:', totalDuration, 'ms');

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1.0);

      this.cvPage.emergenceState.typingProgress = progress;

      // shadow fade-in
      this.cvPage.emergenceState.shadowIntensity = Math.pow(progress, 1.5);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.cvPage.emergenceState.isAnimating = false;
        this.cvPage.emergenceState.shadowIntensity = 1;
        console.log('Herald-style typing animation completed');
      }
    };

    animate();
  }

  // retourne la font pour un caractère (logique herald)
  getGlitchFontForChar(charId, sectionId, charIndex, totalDisplayedChars) {
    const state = this.cvPage.emergenceState;

    // initialiser le caractère si nouveau
    if (!state.charFontIndices.has(charId)) {
      state.charFontIndices.set(charId, 0);
      state.charNoiseOffsets.set(charId, Math.random() * 1000);
    }

    // logique herald: combien de caractères tapés APRÈS ce caractère
    const charactersTypedSince = totalDisplayedChars - 1 - charIndex;
    const maxFontIndex = this.mysticalFonts.length;

    // perlin noise pour désynchroniser
    const noiseOffset = state.charNoiseOffsets.get(charId);
    const noiseValue = noise(noiseOffset + millis() * 0.001);
    const noiseVariation = (noiseValue - 0.5) * 3;

    // progression basée sur charactersTypedSince (comme herald)
    const adjustedProgress = charactersTypedSince + noiseVariation;

    // calculer le targetFontIndex
    const targetFontIndex = Math.min(Math.floor(adjustedProgress * 0.7), maxFontIndex);
    const currentFontIndex = state.charFontIndices.get(charId);
    const newFontIndex = Math.max(currentFontIndex, targetFontIndex);

    // mettre à jour
    state.charFontIndices.set(charId, newFontIndex);

    // construire le tableau de fonts
    const allFonts = [...this.mysticalFonts, this.finalFont];

    // forcer la police finale si animation terminée
    if (!state.isAnimating) {
      return this.finalFont;
    }

    return allFonts[newFontIndex];
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
}