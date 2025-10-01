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

    // temporal control
    this.messageStartTime = 0;
    this.messageCompleteTime = 0;
    this.minDisplayTime = 0;

    // visual configuration
    this.textSize = 18;
    this.textColor = { r: 80, g: 80, b: 80 };

    // typing behavior matrix
    this.TYPING_CONFIG = {
      VOWEL_SPEED: 0.5,
      SPACE_SPEED: 0.2,
      PUNCTUATION_SPEED: 3.0,
      PERLIN_SCALE: 0.01,
      PERLIN_AMPLITUDE: 1.5,
      CURSOR_BLINK_RATE: 500
    };
  }

  // message injection
  addMessage(text, minDisplayTime = 1000) {
    const message = { text, minDisplayTime };

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
  }

  // calculate neural delay patterns
  getNextCharDelay() {
    if (!this.currentMessage) return this.typingSpeed;

    const nextChar = this.currentMessage.text[this.currentCharIndex];
    let delay = this.typingSpeed;

    if (nextChar) {
      if ('aeiouAEIOU'.includes(nextChar)) {
        delay *= this.TYPING_CONFIG.VOWEL_SPEED;
      } else if (nextChar === ' ') {
        delay *= this.TYPING_CONFIG.SPACE_SPEED;
      } else if ('.,!?'.includes(nextChar)) {
        delay *= this.TYPING_CONFIG.PUNCTUATION_SPEED;
      }
    }

    // perlin noise variance simulation
    const perlinValue = noise(this.noiseOffset * this.TYPING_CONFIG.PERLIN_SCALE);
    const noiseMultiplier = 0.3 + perlinValue * this.TYPING_CONFIG.PERLIN_AMPLITUDE;
    delay *= noiseMultiplier;

    // advance noise offset for next character
    this.noiseOffset += 100;

    return delay;
  }

  // main cycle update
  update() {
    this.updateTypingAnimation();
    this.processMessageQueue();
  }

  // character materialization loop
  updateTypingAnimation() {
    if (!this.isTyping || !this.currentMessage) return;

    if (millis() >= this.nextCharTime) {
      if (this.currentCharIndex < this.currentMessage.text.length) {
        this.displayedText += this.currentMessage.text[this.currentCharIndex];
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

    this.applyTextStyle();
    const displayText = this.getDisplayText();
    graphic.text(displayText, this.pos.x, this.pos.y);
  }

  // visual styling matrix
  applyTextStyle() {
    if (fonts.courier) {
      graphic.textFont(fonts.courier);
    }
    graphic.textSize(this.textSize);
    graphic.fill(this.textColor.r, this.textColor.g, this.textColor.b);
    graphic.textAlign(graphic.LEFT, graphic.BASELINE);
  }

  // text buffer with cursor pulse
  getDisplayText() {
    let displayText = this.displayedText;

    if (this.isTyping) {
      const cursorBlink = Math.floor(millis() / this.TYPING_CONFIG.CURSOR_BLINK_RATE) % 2;
      if (cursorBlink) {
        displayText += "_";
      }
    }

    return displayText;
  }

}