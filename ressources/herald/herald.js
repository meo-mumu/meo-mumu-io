class Herald {
  constructor(x = 50, y = 50) {
    // Position d'affichage
    this.pos = { x, y };

    // Etat du system
    this.currentMessage = null;
    this.messageQueue = [];
    this.isTyping = false;

    // Animation de frappe
    this.currentCharIndex = 0;
    this.typingSpeed = 15; 
    this.nextCharTime = 0;
    this.displayedText = "";

    // Timing des messages
    this.messageStartTime = 0;
    this.minDisplayTime = 0;

    // Style
    this.font = null;
    this.textSize = 16;
    this.textColor = { r: 80, g: 80, b: 80 };

    this.loadFont();
  }

  loadFont() {
    // Charger une police pour le Herald
    this.font = loadFont('ressources/fonts/CourierPrime-Regular.ttf');
  }

  // Ajouter un message à la queue
  addMessage(text, minDisplayTime = 1000) {
    //console.log("Herald addMessage:", text + " (minDisplayTime:", minDisplayTime, ")");
    const message = {
      text: text,
      minDisplayTime: minDisplayTime
    };

    // Si pas de message actuel, d�marrer imm�diatement
    if (!this.currentMessage) {
      this.startMessage(message);
    } else {
      // V�rifier si on peut remplacer le message actuel
      if (this.canShowNext()) {
        this.startMessage(message);
        this.messageQueue = []; // Clear la queue
      } else {
        // Ajouter en queue (remplace si d�j� un message en attente)
        this.messageQueue = [message];
      }
    }
  }

  // Vérifier si on peut afficher le message suivant
  canShowNext() {
    if (!this.currentMessage) return true;

    const elapsed = millis() - this.messageStartTime;
    return elapsed >= this.minDisplayTime && !this.isTyping;
  }

  // Démarrer l'affichage d'un nouveau message
  startMessage(message) {
    this.currentMessage = message;
    this.minDisplayTime = message.minDisplayTime;
    this.messageStartTime = millis();
    this.startTyping();
  }

  // Démarrer l'animation de frappe
  startTyping() {
    this.isTyping = true;
    this.currentCharIndex = 0;
    this.displayedText = "";
    this.nextCharTime = millis() + this.getNextCharDelay();
  }

  // Calculer le délai pour le prochain caractère (variation de vitesse)
  getNextCharDelay() {
    if (!this.currentMessage) return this.typingSpeed;

    const nextChar = this.currentMessage.text[this.currentCharIndex];
    let delay = this.typingSpeed;

    // Variation selon le caract�re
    if (nextChar) {
      // Voyelles plus rapides
      if ('aeiouAEIOU'.includes(nextChar)) {
        delay *= 0.6;
      }
      // Consonnes normales
      else if (nextChar.match(/[a-zA-Z]/)) {
        delay *= 1.0;
      }
      // Espaces et ponctuation
      else if (nextChar === ' ') {
        delay *= 0.3;
      }
      else if ('.,!?'.includes(nextChar)) {
        delay *= 2.0;
      }
    }

    // Variation al�atoire pour simuler l'h�sitation
    delay *= (0.7 + Math.random() * 0.6);

    return delay;
  }

  // Mise � jour de la logique (� appeler dans draw)
  update() {
    // Gestion de l'animation de frappe
    if (this.isTyping && this.currentMessage) {
      if (millis() >= this.nextCharTime) {
        if (this.currentCharIndex < this.currentMessage.text.length) {
          // Ajouter le prochain caract�re
          this.displayedText += this.currentMessage.text[this.currentCharIndex];
          this.currentCharIndex++;

          // Programmer le prochain caract�re
          if (this.currentCharIndex < this.currentMessage.text.length) {
            this.nextCharTime = millis() + this.getNextCharDelay();
          } else {
            // Fin de l'animation
            this.isTyping = false;
          }
        }
      }
    }

    // V�rifier si on peut passer au message suivant
    if (this.canShowNext() && this.messageQueue.length > 0) {
      const nextMessage = this.messageQueue.shift();
      this.startMessage(nextMessage);
    }
  }

  // Rendu du texte (� appeler apr�s update)
  render() {

    this.update();
    if (!this.currentMessage) {
      //console.log("Herald render: no current message");
      return;
    }

    //console.log("Herald render: displaying", this.displayedText, "at", this.pos.x, this.pos.y);


    // Configuration du style
    if (this.font) {
      graphic.textFont(this.font);
    }
    graphic.textSize(this.textSize);
    graphic.fill(this.textColor.r, this.textColor.g, this.textColor.b);
    graphic.textAlign(graphic.LEFT, graphic.BASELINE);

    // Affichage du texte en cours de frappe
    let displayText = this.displayedText;

    // Ajouter un curseur si en cours de frappe
    if (this.isTyping) {
      const cursorBlink = Math.floor(millis() / 500) % 2;
      if (cursorBlink) {
        displayText += "_";
      }
    }

    graphic.text(displayText, this.pos.x, this.pos.y);
  }

  // M�thodes utilitaires
  isDisplaying() {
    return this.currentMessage !== null;
  }

  getCurrentMessage() {
    return this.currentMessage ? this.currentMessage.text : null;
  }

  clearQueue() {
    this.messageQueue = [];
  }

  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  setStyle(size, color) {
    this.textSize = size;
    if (color) {
      this.textColor = color;
    }
  }
}