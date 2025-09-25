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

  // Position Herald en bas à gauche
  herald = new Herald(50, height - 50);

  // Initialiser objects pages
  pages.set('mainPage', new MainPage());
  pages.set('cvPage', new CvPage());
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

async function switchTo(pageName) {
  activePage.hide(); // fade graphic -> bg
  //activePage = pages.get(pageName);
  //activePage.appear(); // fade bg -> graphic
}

function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

console.log('Brain initialized with global p5.js functions');