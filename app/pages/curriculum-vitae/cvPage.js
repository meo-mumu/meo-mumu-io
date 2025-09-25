class CvPage {
  constructor() {
    this.nothingHere = null;
  }

  async appear() {
    console.log('CvPage appear');
    shockwave.appearEffect();
    await sleep(5000);
    herald.addMessage("> Oh oh oh, this is my CV page", 3000);
  }

  async hide() {
    console.log('CvPage hide');
    shockwave.hideEffect();
  }

  render() {
    // do nothing for now
  }


}