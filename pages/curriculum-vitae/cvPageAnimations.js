/**
 * Animation et effets pour CvPageP5
 */
class CvPageAnimations {
  constructor(cvPage) {
    this.cvPage = cvPage;
  }

  // Méthodes d'application des shadows
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
}