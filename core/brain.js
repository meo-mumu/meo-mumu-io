let shockwave = null;
let herald = null;
let activePage = null;
let pages = new Map();
let graphic = null;
let backgroundGraphic = null;
let fps = 0;
let fpsHistory = [];
let fpsUpdateInterval = 10; // Mettre à jour le FPS toutes les 15 frames
let frameCounter = 0;

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
  fonts.pokpix1 = loadFont('ressources/fonts/fun/fun/POKPIX1.TTF');
  fonts.pokpix2 = loadFont('ressources/fonts/fun/fun/POKPIX2.TTF');
  fonts.pokpix3 = loadFont('ressources/fonts/fun/fun/POKPIX3.TTF');

  shockwave = new Shockwave();
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent('p5-container');
  background(244, 243, 241);
  graphic = createGraphics(width, height);
  graphic.background(244, 243, 241);
  graphic.fill(80, 80, 80);
  graphic.noStroke();

  backgroundGraphic = createGraphics(width, height);
  backgroundGraphic.background(244, 243, 241);

  // Position Herald en bas à gauche
  herald = new Herald(30, height - 30);

  // Initialiser objects pages
  pages.set('mainPage', new MainPage());
  pages.set('cvPage', new CvPageP5());
  pages.set('shaderland', new ShaderLand());

  // Démarrer sur mainPage
  activePage = pages.get('mainPage');
  activePage.appear();

}

function draw() {
  translate(-width/2, -height/2);
  background(244, 243, 241);
  clear();
  activePage.render();
  herald.render();
  //renderFPS();
  shockwave.render();
}

function renderFPS() {
  frameCounter++;

  // Mettre à jour le FPS toutes les N frames
  if (frameCounter >= fpsUpdateInterval) {
    fpsHistory.push(frameRate());
    if (fpsHistory.length > 5) {
      fpsHistory.shift();
    }
    // Moyenne des dernières valeurs
    let avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
    fps = Math.round(avgFps);
    frameCounter = 0;
  }

  // Afficher FPS en bas à droite sur graphic (avant le shader)
  graphic.textFont(fonts.courier);
  graphic.textSize(18);
  graphic.fill(80, 80, 80);
  graphic.textAlign(graphic.RIGHT, graphic.BASELINE);
  graphic.text(`FPS: ${fps}`, width - 50, height - 45);
}

async function switchTo(pageName) {
  await activePage.hide();
  activePage = pages.get(pageName);
  await activePage.appear();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Check herald first (highest priority)
  if (herald && herald.onMousePressed()) {
    return;
  }

  // Then check active page
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

function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

console.log('Brain initialized with global p5.js functions');