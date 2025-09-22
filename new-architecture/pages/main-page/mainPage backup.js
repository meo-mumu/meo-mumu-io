class MainPage {
  constructor() {
    this.mysteriousText = new MysteriousText();
    this.mainTexts = [];
    this.setupMainTexts();
    this.shockwave = new Shockwave();
    this.graphics = null;
    this.initGraphics();
  }

  initGraphics() {
    this.graphics = createGraphics(width, height);
    this.graphics.textAlign(this.graphics.CENTER, this.graphics.CENTER);
    this.graphics.fill(80);
  }

  setupMainTexts() {
    const center = { x: width / 2, y: height / 2 };
    const lineSpacing = 80;
    const letterSpacing = 15;
    const textColor = { r: 80, g: 80, b: 80 };

    // Configuration des textes avec leurs actions
    const textConfigs = [
      { text: "Curlum vitae", yOffset: -1.5, action: "cv" },
      { text: "Bandcamp", yOffset: -0.5, url: "https://reptilianbusinessrecords.bandcamp.com/album/snk-operator" },
      { text: "Soundcloud", yOffset: 0.5, url: "https://soundcloud.com/meo-sound" },
      { text: "Shaderland", yOffset: 1.5, action: "shaderland" }
    ];

    // Créer les objets texte
    this.mainTexts = textConfigs.map(config => {
      const textObj = this.mysteriousText.createTextObj(
        config.text,
        center.x,
        center.y + lineSpacing * config.yOffset,
        15,
        80
      );

      // Ajouter les propriétés d'interaction
      if (config.action) textObj.action = config.action;
      if (config.url) textObj.url = config.url;

      return textObj;
    });
  }

  appear() {
    console.log('MainPage appear (TODO)');
  }

  render() {
    //this.testRenderRedCircle();
    // this.shockwave.beginRender(this.graphics);
    this.renderMysteriousTexts();
    // this.shockwave.endRender();

    //this.testRenderBufferGraphics();
    image(this.graphics, 0, 0);
    this.graphics.clear();
  }

  async hide() {
    if (this.shockwave?.isInitialized) {
      await this.shockwave.triggerBigShockwaveAnimation();
    }
  }

  testRenderRedCircle() {
    fill(255, 0, 0);
    noStroke();
    ellipse(mouseX, mouseY, 10, 10);
  }

  testRenderBufferGraphicsRedCircle() {
    //this.graphics.background(244, 243, 241);
    this.graphics.clear();
    this.graphics.fill(255, 0, 0);
    this.graphics.noStroke();
    this.graphics.ellipse(mouseX, mouseY, 10, 10);
    //translate(width/2, height/2);
    image(this.graphics, 0, 0);
  }

  renderMysteriousTexts() {
    for (let textObj of this.mainTexts) {
      this.mysteriousText.render(textObj, this.graphics);
    }
  }

  onMousePressed() {
    if (!this.isActive) return;
    for (let textObj of this.mainTexts) {
      if (this.mysteriousText.isHoveringText(textObj)) {
        this.handleTextClick(textObj);
        break;
      }
    }
  }

  async handleTextClick(textObj) {
    if (textObj.action === "cv") {
      console.log('🔗 Navigate to CV');
      await this.hide();
      switchTo('cvPage');
    } else if (textObj.action === "shaderland") {
      console.log('🔗 Navigate to Shaderland');
      await this.hide();
      switchTo('shaderland');
    } else if (textObj.url) {
      console.log('= Opening URL:', textObj.url);
      window.open(textObj.url, '_blank');
    }
  }


}