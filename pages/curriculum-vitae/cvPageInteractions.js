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

    return mouseX >= container.x &&
           mouseX <= container.x + container.width &&
           mouseY >= container.y &&
           mouseY <= container.y + container.height;
  }

  isMouseOnScrollbar() {
    const bounds = this.cvPage.ui.scrollbarBounds;
    // Zone interactive élargie pour inclure le thumb (qui est plus large que le track)
    const interactiveX = bounds.thumbX;
    const interactiveWidth = bounds.thumbWidth;
    return mouseX >= interactiveX &&
           mouseX <= interactiveX + interactiveWidth &&
           mouseY >= bounds.trackY &&
           mouseY <= bounds.trackY + bounds.trackHeight;
  }

  isMouseOnThumb() {
    const bounds = this.cvPage.ui.scrollbarBounds;
    return mouseX >= bounds.thumbX &&
           mouseX <= bounds.thumbX + bounds.thumbWidth &&
           mouseY >= bounds.thumbY &&
           mouseY <= bounds.thumbY + bounds.thumbHeight;
  }

  jumpToMousePosition() {
    const bounds = this.cvPage.ui.scrollbarBounds;
    const relativeY = mouseY - bounds.trackY;
    const trackProgress = constrain(relativeY / bounds.trackHeight, 0, 1);
    this.cvPage.scrollState.target = trackProgress * this.cvPage.scrollState.max;
  }
}