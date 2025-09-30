let shockwave = null;
let herald = null;
let activePage = null;
let pages = new Map();
let graphic = null;
let backgroundGraphic = null;

// Système global de fonts
let fonts = {};

function preload() {
  // Preload des fonts
  fonts.courier = loadFont('ressources/fonts/CourierPrime-Regular.ttf');
  fonts.segoeUI = loadFont('ressources/fonts/segoe-ui-this/segoeuithis.ttf');
  fonts.segoeUIBold = loadFont('ressources/fonts/segoe-ui-this/segoeuithibd.ttf');
  fonts.segoeUIItalic = loadFont('ressources/fonts/segoe-ui-this/segoeuithisi.ttf');
  fonts.darune = loadFont('ressources/fonts/rune/DARUNE.otf');
  fonts.glagolitsa = loadFont('ressources/fonts/rune/Glagolitsa.ttf');
  fonts.ancientModern = loadFont('ressources/fonts/rune/Ancient_G_Modern.ttf');
  fonts.highschoolRunes = loadFont('ressources/fonts/rune/Highschool_Runes.ttf');
  fonts.ninjargon = loadFont('ressources/fonts/rune/Ninjargon-Regular.otf');
  fonts.nyctographic = loadFont('ressources/fonts/rune/Nyctographic.otf');
  fonts.graceOfEtro = loadFont('ressources/fonts/rune/grace_of_etro.ttf');

  shockwave = new Shockwave();
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent('p5-container');
  background(244, 243, 241);
  graphic = createGraphics(width, height);
  graphic.fill(80, 80, 80);
  graphic.noStroke();

  backgroundGraphic = createGraphics(width, height);
  backgroundGraphic.background(244, 243, 241);

  // Position Herald en bas à gauche
  herald = new Herald(50, height - 45);

  // Initialiser objects pages
  pages.set('mainPage', new MainPage());
  pages.set('cvPage', new CvPageP5());
  // pages.set('shaderland', new ShaderLand());

  // Démarrer sur mainPage
  activePage = pages.get('mainPage');
  activePage.appear();
}

function draw() {
  translate(-width/2, -height/2);
  background(244, 243, 241);
  clear();
  graphic.background(244, 243, 241);
  activePage.render();
  herald.render();
  shockwave.render();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (activePage) {
    activePage.onMousePressed();
  }
}

function mouseWheel(event) {
  if (activePage && activePage.onMouseWheel) {
    return activePage.onMouseWheel(event);
  }
}

function mouseReleased() {
  if (activePage && activePage.onMouseReleased) {
    activePage.onMouseReleased();
  }
}

function mouseDragged() {
  if (activePage && activePage.onMouseDragged) {
    activePage.onMouseDragged();
  }
}

async function switchTo(pageName) {
  await activePage.hide(); // fade graphic -> bg
  activePage = pages.get(pageName);
  await activePage.appear(); // fade bg -> graphic
}

function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

console.log('Brain initialized with global p5.js functions');