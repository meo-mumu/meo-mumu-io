class MainPage {
  constructor() {
    this.mysteriousTexts = [];
    this.setupMysteriousTexts();
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
        textColor,
        25 // size de base
      );
      textObj.action = item.action;
      this.mysteriousTexts.push(textObj);
    });
  }

  async appear() {
    console.log('MainPage appear');
    shockwave.appearEffect(type = "central-bubbling");
    await sleep(5000);
    herald.addMessage("> Hello there", 3000);
    herald.addMessage("> Try Moving the mouse", 10000);
  }

  async hide() {
    console.log('MainPage hide');
    shockwave.hideEffect();
  }

  render() {
    for (let mysText of this.mysteriousTexts) { mysText.render();}
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