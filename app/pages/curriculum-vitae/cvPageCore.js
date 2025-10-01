/**
 * CV Page component using p5.js for rendering
 * Implements a scrollable CV with neomorphic design elements
 */
class CvPageP5 {
  constructor() {
    // Color constants
    this.COLORS = {
      BACKGROUND: [244, 243, 241],
      SHADOW: [38, 38, 46, 0.3] // Consistent with shockwave shader
    };

    // Shadow configurations for different elements
    this.SHADOW_CONFIG = {
      NORMAL: { blur: 15, offsetX: 8, offsetY: 8 },
      LIGHT: { blur: 6, offsetX: 3, offsetY: 3 }
    };

    // Layout constants to avoid magic numbers
    this.LAYOUT_CONSTANTS = {
      TAG_OFFSET: 180,
      TITLE_OFFSET: 160,
      TASK_OFFSET: 180,
      EDUCATION_DETAIL_OFFSET: 170,
      EDUCATION_TITLE_OFFSET: 150,
      SECTION_SPACING: 20,
      TAG_HEIGHT: 26,
      TAG_PADDING: 16,
      TAG_LINE_SPACING: 30
    };

    // Animation state for emergence effect
    this.emergenceState = {
      isAnimating: false,
      progress: 0,
      scale: 1.0,
      shadowIntensity: 1.0,
      neomorphicStyle: 'raised'
    };

    this.scrollState = {
      current: 0,
      target: 0,
      max: 0,
      isDragging: false
    };

    this.ui = {
      contentHeight: 0,
      scrollbarBounds: {},
      exportButtonBounds: {}
    };

    this.assets = {
      profileImage: null
    };

    this.theme = CV_THEME;
    this.content = CV_CONTENT;

    // Initialize modules
    this.animator = new CvPageAnimations(this);
    this.renderer = new CvPageRenderers(this);
    this.interactor = new CvPageInteractions(this);
    this.exporter = new CvPageExport(this);

    this.loadAssets();
  }

  loadAssets() {
    loadImage(this.content.personal.photoPath,
      (img) => {
        this.assets.profileImage = img;
        console.log('Profile image loaded successfully');
      },
      (err) => console.error('Failed to load profile image:', err)
    );
  }

  async appear() {
    console.log('CvPageP5 appear');

    // Lancer le shockwave effect et l'animation d'émergence en parallèle
    shockwave.appearEffect('extended-bubbling');
    this.animator.startEmergenceAnimation();
    await sleep(2000);
    shockwave.cvMode = true;

    await sleep(5000);
    herald.addMessage("> Voici mon CV en p5.js", 3000);
  }

  async hide() {
    console.log('CvPageP5 hide');
    shockwave.cvMode = false;
    shockwave.hideEffect();
  }

  // === UTILITY METHODS ===
  // Core helper methods for rendering and text manipulation

  applyFont(context = graphic) {
    if (fonts.segoeUI) context.textFont(fonts.segoeUI);
  }

  applyColor(colorArray, context = graphic) {
    context.fill(...colorArray);
  }

  setTextStyle(size, colorArray, align = graphic.LEFT, context = graphic) {
    this.applyFont(context);
    context.textSize(size);
    context.textAlign(align, context.TOP);
    this.applyColor(colorArray, context);
  }

  createClippingMask(x, y, width, height, borderRadius = 0, context = graphic) {
    context.push();
    context.drawingContext.save();
    context.drawingContext.beginPath();

    if (borderRadius > 0) {
      context.drawingContext.roundRect(x, y, width, height, borderRadius);
    } else {
      context.drawingContext.rect(x, y, width, height);
    }

    context.drawingContext.clip();
    return () => {
      context.drawingContext.restore();
      context.pop();
    };
  }

  wrapText(text, maxWidth, fontSize, context = graphic) {
    this.applyFont(context);
    context.textSize(fontSize);

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (context.textWidth(testLine) > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  calculateLayout() {
    const containerWidth = min(width * 0.95, 1400);
    const containerX = (width - containerWidth) / 2;
    const containerY = 50;
    const containerHeight = height - 2 * containerY;
    const padding = this.theme.dimensions.containerPadding;
    const contentWidth = containerWidth - 2 * padding;

    return {
      container: { x: containerX, y: containerY, width: containerWidth, height: containerHeight },
      content: { x: containerX + padding, width: contentWidth, startY: containerY + padding },
      padding
    };
  }

  // === DELEGATION TO MODULES ===

  render() {
    this.renderer.render();
  }

  onMousePressed() {
    this.interactor.onMousePressed();
  }

  onMouseReleased() {
    this.interactor.onMouseReleased();
  }

  onMouseDragged() {
    this.interactor.onMouseDragged();
  }

  onMouseWheel(event) {
    return this.interactor.onMouseWheel(event);
  }
}