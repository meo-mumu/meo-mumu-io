/**
 * herald - neural message transmission system
 * orchestrates holographic text manifestation with synthetic typing patterns
 */
class Herald {
  constructor(x = 50, y = 50) {
    // spatial coordinates
    this.pos = { x, y };

    // message buffer state
    this.currentMessage = null;
    this.messageQueue = [];
    this.isTyping = false;

    // typing synthesis parameters
    this.currentCharIndex = 0;
    this.typingSpeed = 45;
    this.nextCharTime = 0;
    this.displayedText = "";
    this.noiseOffset = Math.random() * 1000;

    // character transformation tracking
    this.charFontIndices = [];
    this.charNoiseOffsets = [];

    // temporal control
    this.messageStartTime = 0;
    this.messageCompleteTime = 0;
    this.minDisplayTime = 0;

    // visual configuration
    this.textSize = 16;
    this.textColor = { r: 80, g: 80, b: 80 };

    // underline animation for clickable messages
    this.underlineProgress = 0;
    this.isHovered = false;
    this.hoverStartTime = 0;

    // font transformation system
    this.initTransformationFonts();

    // typing behavior matrix
    this.TYPING_CONFIG = {
      VOWEL_SPEED: 0.5,
      SPACE_SPEED: 0.2,
      PUNCTUATION_SPEED: 3.0,
      PERLIN_SCALE: 0.01,
      PERLIN_AMPLITUDE: 1.5,
      CURSOR_BLINK_RATE: 500,
      FONT_TRANSFORM_DELAY: 1200 // ms between font transformations
    };
  }

  // font transformation sequence initialization
  initTransformationFonts() {
    this.transformationFonts = [
      {
        font: fonts.ancientModern,
        sizeScale: 1.0,
        name: "ancient"
      },
      {
        font: fonts.graceOfEtro,
        sizeScale: 1.0,
        name: "grace"
      },
      {
        font: fonts.highschoolRunes,
        sizeScale: 1.0,
        name: "runes"
      },
      {
        font: fonts.courier,
        sizeScale: 1.0,
        name: "courier"
      }
    ];
  }

  // message injection
  addMessage(text, minDisplayTime = 1000, action = null) {
    const message = { text, minDisplayTime, action };

    if (!this.currentMessage) {
      this.startMessage(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  // channel availability check
  canShowNext() {
    if (!this.currentMessage) return true;
    if (this.isTyping) return false;
    const elapsed = millis() - this.messageCompleteTime;
    return elapsed >= this.minDisplayTime;
  }

  // ------------------------------------------------------------------- synthesis engine

  // initialize message transmission
  startMessage(message) {
    this.currentMessage = message;
    this.minDisplayTime = message.minDisplayTime;
    this.messageStartTime = millis();
    this.startTyping();
  }

  // begin character materialization
  startTyping() {
    this.isTyping = true;
    this.currentCharIndex = 0;
    this.displayedText = "";
    this.nextCharTime = millis() + this.getNextCharDelay();

    // initialize character tracking arrays
    this.charFontIndices = [];
    this.charNoiseOffsets = [];
  }

  // calculate neural delay patterns
  getNextCharDelay() {
    if (!this.currentMessage) return this.typingSpeed;

    const nextChar = this.currentMessage.text[this.currentCharIndex];
    let delay = this.typingSpeed;

    // smoother perlin noise variance simulation
    const perlinValue = noise(this.noiseOffset * this.TYPING_CONFIG.PERLIN_SCALE);
    const noiseMultiplier = 0.4 + perlinValue * 0.3; // range: 0.7 to 1.3
    delay *= noiseMultiplier;

    // advance noise offset for next character
    this.noiseOffset += 50;

    return delay;
  }

  // main cycle update
  update() {
    this.updateTypingAnimation();
    this.updateCharacterTransformations();
    this.updateUnderlineAnimation();
    this.processMessageQueue();
  }

  // update underline animation based on hover
  updateUnderlineAnimation() {
    const isCurrentlyHovered = this.isHoveringMessage();
    const isClickable = this.currentMessage && this.currentMessage.action;

    if (isClickable && isCurrentlyHovered && !this.isHovered) {
      // Start hover
      this.isHovered = true;
      this.hoverStartTime = millis();
    } else if (!isCurrentlyHovered && this.isHovered) {
      // End hover
      this.isHovered = false;
      this.hoverStartTime = 0;
    }

    // Animate underline progress
    if (this.isHovered) {
      let elapsedTime = millis() - this.hoverStartTime;
      let animationDuration = 200;
      this.underlineProgress = Math.min(elapsedTime / animationDuration, 1.0);
    } else {
      this.underlineProgress = 0;
    }
  }

  // update character-by-character font transformations
  updateCharacterTransformations() {
    // transform characters based on new character appearances with perlin noise
    for (let i = 0; i < this.charFontIndices.length; i++) {
      const charactersTypedSince = this.displayedText.length - 1 - i;
      const maxFontIndex = this.transformationFonts.length - 1;

      // apply perlin noise to transformation timing per character
      const noiseValue = noise(this.charNoiseOffsets[i] + millis() * 0.001);
      const noiseVariation = (noiseValue - 0.5) * 3; // -1.5 to +1.5 variation
      const adjustedProgress = charactersTypedSince + noiseVariation;

      // advance font index based on adjusted progress
      const targetFontIndex = Math.min(Math.floor(adjustedProgress * 0.7), maxFontIndex);
      this.charFontIndices[i] = Math.max(this.charFontIndices[i], targetFontIndex);
    }

    // ensure final transformation when typing is complete
    if (!this.isTyping && this.currentMessage) {
      for (let i = 0; i < this.charFontIndices.length; i++) {
        this.charFontIndices[i] = this.transformationFonts.length - 1;
      }
    }
  }

  // character materialization loop
  updateTypingAnimation() {
    if (!this.isTyping || !this.currentMessage) return;

    if (millis() >= this.nextCharTime) {
      if (this.currentCharIndex < this.currentMessage.text.length) {
        this.displayedText += this.currentMessage.text[this.currentCharIndex];

        // initialize character with first font and unique noise offset
        this.charFontIndices.push(0);
        this.charNoiseOffsets.push(Math.random() * 1000);

        this.currentCharIndex++;

        if (this.currentCharIndex < this.currentMessage.text.length) {
          this.nextCharTime = millis() + this.getNextCharDelay();
        } else {
          this.isTyping = false;
          this.messageCompleteTime = millis();
        }
      }
    }
  }

  // queue processing cycle
  processMessageQueue() {
    if (this.canShowNext() && this.messageQueue.length > 0) {
      const nextMessage = this.messageQueue.shift();
      this.startMessage(nextMessage);
    }
  }

  // holographic projection
  render() {
    this.update();
    if (!this.currentMessage) return;

    this.renderTransformingText();
    this.renderCursor();
  }

  // render blinking cursor separately
  renderCursor() {
    if (this.isTyping) {
      const cursorBlink = Math.floor(millis() / this.TYPING_CONFIG.CURSOR_BLINK_RATE) % 2;
      if (cursorBlink) {
        // calculate cursor position after last character
        let xOffset = 0;
        for (let i = 0; i < this.displayedText.length; i++) {
          const char = this.displayedText[i];
          const fontIndex = this.charFontIndices[i] || 0;
          const currentFont = this.transformationFonts[fontIndex];

          graphic.textFont(currentFont.font);
          graphic.textSize(this.textSize * currentFont.sizeScale);
          xOffset += graphic.textWidth(char);
        }

        // render cursor with current font
        const lastFontIndex = this.charFontIndices[this.charFontIndices.length - 1] || 0;
        const cursorFont = this.transformationFonts[lastFontIndex];
        graphic.textFont(cursorFont.font);
        graphic.textSize(this.textSize * cursorFont.sizeScale);
        graphic.text("_", this.pos.x + xOffset, this.pos.y);
      }
    }
  }

  // render text with per-character font transformation
  renderTransformingText() {
    // Detect hover for clickable messages
    const isHovering = this.isHoveringMessage();
    const isClickable = this.currentMessage && this.currentMessage.action;

    // Keep text color constant
    graphic.fill(this.textColor.r, this.textColor.g, this.textColor.b);

    graphic.textAlign(graphic.LEFT, graphic.BASELINE);

    let xOffset = 0;

    for (let i = 0; i < this.displayedText.length; i++) {
      const char = this.displayedText[i];
      const fontIndex = this.charFontIndices[i] || 0;
      const currentFont = this.transformationFonts[fontIndex];

      graphic.textFont(currentFont.font);
      graphic.textSize(this.textSize * currentFont.sizeScale);

      graphic.text(char, this.pos.x + xOffset, this.pos.y);

      // calculate width for next character position
      xOffset += graphic.textWidth(char);
    }

    // Store bounds for interaction
    this.messageBounds = {
      x: this.pos.x,
      y: this.pos.y - this.textSize,
      width: xOffset,
      height: this.textSize * 1.5
    };

    // Draw progressive underline for clickable messages on hover
    if (isClickable && this.underlineProgress > 0) {
      const lineY = this.pos.y + 7;
      const lineWidth = xOffset;
      const currentEndX = this.pos.x + (lineWidth * this.underlineProgress);

      graphic.stroke(this.textColor.r, this.textColor.g, this.textColor.b);
      graphic.strokeWeight(1);
      graphic.line(this.pos.x, lineY, currentEndX, lineY);
      graphic.noStroke();
    }
  }

  // ------------------------------------------------------------------- interaction

  isHoveringMessage() {
    if (!this.currentMessage || !this.messageBounds) return false;

    const bounds = this.messageBounds;
    return mouseX >= bounds.x &&
           mouseX <= bounds.x + bounds.width &&
           mouseY >= bounds.y &&
           mouseY <= bounds.y + bounds.height;
  }

  onMousePressed() {
    if (!this.currentMessage || !this.currentMessage.action) return false;

    if (this.isHoveringMessage()) {
      this.currentMessage.action();
      return true;
    }

    return false;
  }

}