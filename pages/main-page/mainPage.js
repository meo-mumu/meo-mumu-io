class MainPage {
  constructor() {
    this.mysteriousTexts = [];
    this.setupMysteriousTexts();
    this.isAppear = false;
  }

  setupMysteriousTexts() {
    const center = { x: width / 2, y: height / 2 };
    const lineSpacing = 80;
    const letterSpacing = 15;
    const textColor = { r: 80, g: 80, b: 80 };

    const mainTexts = [
      { text: "Curiculum vitae", action: () => { switchTo('cvPage'); } },
      { text: "Bandcamp", action: () => { window.open('https://reptilianbusinessrecords.bandcamp.com/album/snk-operator', '_blank'); } },
      { text: "Soundcloud", action: () => { window.open('https://soundcloud.com/meo-sound', '_blank'); } },
      { text: "Shaderland", action: () => { switchTo('shaderland'); } }
    ];

    mainTexts.forEach((item, index) => {
      const textObj = new MysteriousText(
        item.text,
        { x: center.x, y: center.y + lineSpacing * (index - 1.5) },
        letterSpacing,
        textColor
      );
      textObj.action = item.action;
      this.mysteriousTexts.push(textObj);
    });
  }

  async appear() {
    console.log('MainPage appear');
    // Démarrer l'animation d'apparition
    //this.isAppear = false;
    //await sleep(1000);
    
    await shockwave.apparitionMainPage();
    await sleep(1000);
    herald.addMessage("> Hello there", 3000);
    herald.addMessage("> Move the mouse", 10000);
  }

  render() {
    for (let mysText of this.mysteriousTexts) {
      mysText.render();
    }
    
  }

  async hide() {
    console.log('MainPage hide');
  }

  testRenderRedCircle() {
    fill(255, 0, 0);
    noStroke();
    ellipse(mouseX, mouseY, 10, 10);
  }

  testRenderBufferGraphicsRedCircle() {
    //this.graphics.background(244, 243, 241);
    this.graphic.clear();
    this.graphic.fill(255, 0, 0);
    this.graphic.noStroke();
    this.graphic.ellipse(mouseX, mouseY, 10, 10);
    //translate(width/2, height/2);
    image(this.graphic, 0, 0);
  }

  onMousePressed() {
    for (let mysteriousMainText of this.mysteriousTexts) {
      if (mysteriousMainText.isHoveringText()) {
        if (mysteriousMainText.action) {
          mysteriousMainText.action();
          break;
        }
      }
    }
  }


}