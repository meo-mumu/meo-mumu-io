/**
 * Gestion des interactions pour CvPageP5
 */
class CvPageInteractions {
  constructor(cvPage) {
    this.cvPage = cvPage;
  }

  onMousePressed() {
    // Check export button click
    if (this.cvPage.ui.exportButtonBounds) {
      const bounds = this.cvPage.ui.exportButtonBounds;
      const isInside = mouseX >= bounds.x &&
             mouseX <= bounds.x + bounds.width &&
             mouseY >= bounds.y &&
             mouseY <= bounds.y + bounds.height;

      if (isInside) {
        this.cvPage.exporter.exportToPDF();
        return;
      }
    }

    // Check scrollbar interaction
    if (this.cvPage.scrollState.max > 0 && this.isMouseOnScrollbar()) {
      this.cvPage.scrollState.isDragging = true;

      // Jump to position if clicking on track (not thumb)
      if (!this.isMouseOnThumb()) {
        this.jumpToMousePosition();
      }
      return;
    }

    // Check if click is outside container - return to main page
    if (!this.isMouseInContainer()) {
      switchTo('mainPage');
    }
  }

  onMouseReleased() {
    this.cvPage.scrollState.isDragging = false;
  }

  onMouseDragged() {
    if (this.cvPage.scrollState.isDragging) {
      this.jumpToMousePosition();
    }
  }

  onMouseWheel(event) {
    this.handleScroll(event.delta * 3);
    return false;
  }

  handleScroll(deltaY) {
    this.cvPage.scrollState.target = constrain(this.cvPage.scrollState.target + deltaY, 0, this.cvPage.scrollState.max);
  }

  // === INTERACTION HELPERS ===

  isMouseInContainer() {
    const layout = this.cvPage.calculateLayout();
    const container = layout.container;

    // Ajuster les coordonnées pour le système WEBGL (même logique que dans shockwave)
    const adjustedMouseX = mouseX - width/2;
    const adjustedMouseY = mouseY - height/2;

    // Convertir les bounds du container en coordonnées WEBGL
    const webglX = container.x - width/2;
    const webglY = container.y - height/2;

    return adjustedMouseX >= webglX &&
           adjustedMouseX <= webglX + container.width &&
           adjustedMouseY >= webglY &&
           adjustedMouseY <= webglY + container.height;
  }

  isMouseOnScrollbar() {
    const bounds = this.cvPage.ui.scrollbarBounds;
    const adjustedMouseX = mouseX - width/2;
    const adjustedMouseY = mouseY - height/2;
    return adjustedMouseX >= bounds.trackX &&
           adjustedMouseX <= bounds.trackX + bounds.trackWidth &&
           adjustedMouseY >= bounds.trackY &&
           adjustedMouseY <= bounds.trackY + bounds.trackHeight;
  }

  isMouseOnThumb() {
    const bounds = this.cvPage.ui.scrollbarBounds;
    const adjustedMouseX = mouseX - width/2;
    const adjustedMouseY = mouseY - height/2;
    return adjustedMouseX >= bounds.thumbX &&
           adjustedMouseX <= bounds.thumbX + bounds.thumbSize &&
           adjustedMouseY >= bounds.thumbY &&
           adjustedMouseY <= bounds.thumbY + bounds.thumbSize;
  }

  jumpToMousePosition() {
    const bounds = this.cvPage.ui.scrollbarBounds;
    const adjustedMouseY = mouseY - height/2;
    const relativeY = adjustedMouseY - bounds.trackY;
    const trackProgress = constrain(relativeY / bounds.trackHeight, 0, 1);
    this.cvPage.scrollState.target = trackProgress * this.cvPage.scrollState.max;
  }
}