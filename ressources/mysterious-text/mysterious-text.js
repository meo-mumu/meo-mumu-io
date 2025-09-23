class MysteriousText {
  constructor(text, pos, spacing, color) {
    this.text = text;
    this.pos = pos;
    this.spacing = spacing;
    this.color = color;
    this.sensitivities = Array.from({length: text.length}, () => (Math.random() - 0.5) * 0.4);
    this.hoverStartTime = 0;
    this.isHovered = false;
    this.underlineProgress = 0;
    this.mysteriousFonts = null;
    this.preloadFont();
  }

 
  preloadFont() {
    // Charger toutes les polices en preload
    this.mysteriousFonts = [
      {
        font: loadFont('ressources/fonts/CourierPrime-Regular.ttf'),
        size: 25,
        threshold: 0.8
      },
      {
        font: loadFont('ressources/fonts/rune/Highschool_Runes.ttf'),
        size: 35,
        threshold: 0.88
      },
      {
        font: loadFont('ressources/fonts/rune/grace_of_etro.ttf'),
        size: 35,
        threshold: 0.95
      },
      {
        font: loadFont('ressources/fonts/rune/Ancient_G_Modern.ttf'),
        size: 35,
        threshold: 1.0
      }
    ];
  }


  isHoveringText() {
    const startX = this.pos.x - (this.text.length * this.spacing) / 2 + this.spacing / 2;
    const endX = startX + (this.text.length - 1) * this.spacing;
    const textHeight = 40;

    return mouseX >= startX - this.spacing/2 &&
           mouseX <= endX + this.spacing/2 &&
           mouseY >= this.pos.y - textHeight/2 &&
           mouseY <= this.pos.y + textHeight/2;
  }


  getFontIndex(t) {
    let fontIndex = this.mysteriousFonts.findIndex(fontObj => t < fontObj.threshold);
    if (fontIndex === -1) fontIndex = this.mysteriousFonts.length - 1;
    return fontIndex;
  }

  render() {
    
    // Gestion du hover et underline
    const isCurrentlyHovered = this.isHoveringText();

    if (isCurrentlyHovered && !this.isHovered) {
      this.isHovered = true;
      this.hoverStartTime = millis();
    } else if (!isCurrentlyHovered && this.isHovered) {
      this.isHovered = false;
      this.hoverStartTime = 0;
    }

    // Animation underline
    if (this.isHovered) {
      let elapsedTime = millis() - this.hoverStartTime;
      let animationDuration = 200;
      this.underlineProgress = Math.min(elapsedTime / animationDuration, 1.0);
    } else {
      this.underlineProgress = 0;
    }

    // Rendu lettre par lettre
    this.renderLetters();

    // Rendu underline
    if (this.underlineProgress > 0) {
      this.renderUnderline();
    }
  }

  renderLetters() {
    const startX = this.pos.x - (this.text.length * this.spacing) / 2 + this.spacing / 2;
    const maxDist = Math.min(graphic.width, graphic.height) / 2;

    // textAlign déjà configuré dans initGraphics()

    for (let i = 0; i < this.text.length; i++) {
      const letterX = startX + i * this.spacing;
      const letterY = this.pos.y;
      const d = graphic.dist(mouseX, mouseY, letterX, letterY);
      const t = graphic.constrain((d / maxDist) + this.sensitivities[i], 0, 1);

      const fontIndex = this.getFontIndex(t);

      graphic.textFont(this.mysteriousFonts[fontIndex].font);
      graphic.textSize(this.mysteriousFonts[fontIndex].size);
      graphic.fill(this.color.r, this.color.g, this.color.b);
      graphic.text(this.text[i], letterX, letterY);
    }
  }

  renderUnderline(g) {
    const startX = this.pos.x - (this.text.length * this.spacing) / 2 + this.spacing / 2;
    const startXLine = startX - this.spacing/2;
    const endXLine = startX + (this.text.length - 1) * this.spacing + this.spacing/2;
    const lineWidth = endXLine - startXLine;
    const currentEndX = startXLine + (lineWidth * this.underlineProgress);

    graphic.stroke(this.color.r, this.color.g, this.color.b);
    graphic.strokeWeight(1);
    graphic.line(startXLine, this.pos.y + 20, currentEndX, this.pos.y + 20);
    graphic.noStroke();
  }
}