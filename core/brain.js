let shockwave = null;
let herald = null;
let activePage = null;
let pages = new Map();
let graphic = null;
let backgroundGraphic = null;

function preload() {
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

  // Position Herald en bas à gauche, en tenant compte de la translation WEBGL
  herald = new Herald(50, height - 50);

  pages.set('mainPage', new MainPage());
  // pages.set('cvPage', new CVPage());
  // pages.set('shaderland', new ShaderLand());
  switchTo('mainPage');
}

function draw() {
  translate(-width/2, -height/2);
  //background(244, 243, 241);
  //clear();
  graphic.background(244, 243, 241);
  herald.render();
  activePage.render();
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

function switchTo(pageName) {
  if (activePage) {
    console.log('Hiding current page:', pageName);
    // Temporairement désactivé pour éviter conflit avec animation d'apparition
    // activePage.hide();
  }
  activePage = pages.get(pageName);
  if (activePage) {
    activePage.appear();
  } else {
    console.log('[ERROR] Page not found:', pageName);
  }
}

function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

console.log('Brain initialized with global p5.js functions');