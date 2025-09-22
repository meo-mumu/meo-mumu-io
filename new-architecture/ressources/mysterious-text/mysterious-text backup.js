/**
 * MysteriousText - Ressource d'affichage de texte avec polices progressives
 * Texte qui change de police selon la distance de la souris
 */

class MysteriousText {
  constructor() {
    this.fonts = null;
    this.preloadFont();
  }

  preloadFont() {
    // Charger toutes les polices en preload
    this.fonts = [
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


  createTextObj(text, x, y, spacing = 15, color = 80) {
    return {
      text: text,
      x: x,
      y: y,
      spacing: spacing,
      color: color,
      sensitivities: Array.from({length: text.length}, () => (Math.random() - 0.5) * 0.4),
      hoverStartTime: 0,
      isHovered: false,
      underlineProgress: 0
    };
  }


  isHoveringText(textObj) {
    const startX = textObj.x - (textObj.text.length * textObj.spacing) / 2 + textObj.spacing / 2;
    const endX = startX + (textObj.text.length - 1) * textObj.spacing;
    const textHeight = 40;

    return mouseX >= startX - textObj.spacing/2 &&
           mouseX <= endX + textObj.spacing/2 &&
           mouseY >= textObj.y - textHeight/2 &&
           mouseY <= textObj.y + textHeight/2;
  }


  getFontIndex(t) {
    let fontIndex = this.fonts.findIndex(fontObj => t < fontObj.threshold);
    if (fontIndex === -1) fontIndex = this.fonts.length - 1;
    return fontIndex;
  }

  render(textObj, graphics = null) {

    //console.log('graphics : ', graphics);
    // Utiliser le graphics buffer si fourni, sinon les fonctions globales
    const g = graphics || window;

    // Gestion du hover et underline
    const isCurrentlyHovered = this.isHoveringText(textObj);

    if (isCurrentlyHovered && !textObj.isHovered) {
      textObj.isHovered = true;
      textObj.hoverStartTime = millis();
    } else if (!isCurrentlyHovered && textObj.isHovered) {
      textObj.isHovered = false;
      textObj.hoverStartTime = 0;
    }

    // Animation underline
    if (textObj.isHovered) {
      let elapsedTime = millis() - textObj.hoverStartTime;
      let animationDuration = 200;
      textObj.underlineProgress = Math.min(elapsedTime / animationDuration, 1.0);
    } else {
      textObj.underlineProgress = 0;
    }

    // Rendu lettre par lettre
    this.renderLetters(textObj, g);

    // Rendu underline
    if (textObj.underlineProgress > 0) {
      this.renderUnderline(textObj, g);
    }
  }

  renderLetters(textObj, g) {
    const startX = textObj.x - (textObj.text.length * textObj.spacing) / 2 + textObj.spacing / 2;
    const maxDist = Math.min(g.width, g.height) / 2;

    g.textAlign(g.CENTER, g.CENTER);

    for (let i = 0; i < textObj.text.length; i++) {
      const letterX = startX + i * textObj.spacing;
      const letterY = textObj.y;
      const d = g.dist(mouseX, mouseY, letterX, letterY);
      const t = g.constrain((d / maxDist) + textObj.sensitivities[i], 0, 1);

      const fontIndex = this.getFontIndex(t);

      g.textFont(this.fonts[fontIndex].font);
      g.textSize(this.fonts[fontIndex].size);
      g.fill(textObj.color);
      g.text(textObj.text[i], letterX, letterY);
    }
  }

  renderUnderline(textObj, g) {
    const startX = textObj.x - (textObj.text.length * textObj.spacing) / 2 + textObj.spacing / 2;
    const startXLine = startX - textObj.spacing/2;
    const endXLine = startX + (textObj.text.length - 1) * textObj.spacing + textObj.spacing/2;
    const lineWidth = endXLine - startXLine;
    const currentEndX = startXLine + (lineWidth * textObj.underlineProgress);

    g.stroke(textObj.color);
    g.strokeWeight(1);
    g.line(startXLine, textObj.y + 20, currentEndX, textObj.y + 20);
    g.noStroke();
  }
}