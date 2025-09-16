/**
 * Brain.js - Orchestrateur principal du portfolio
 * Fonctions p5.js globales pour gérer l'instance unique et la navigation entre les Pages
 */

// Toutes les classes sont maintenant globales - plus d'imports nécessaires

// Variables globales du module
let activePage = null;
let pages = new Map();
let shockwave = null;
let graphics = null;

function preload() {
  // Précharger les ressources communes
  shockwave = new Shockwave();
  shockwave.preload();

  // Enregistrer et précharger les Pages
  pages.set('mainPage', new MainPage());
  pages.set('cvPage', new CVPage());
  pages.set('shaderland', new ShaderLand());

  // Les pages se chargent en preload pour les fonts
  for (let page of pages.values()) {
    page.preload();
  }
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent('p5-container');
  background(244, 243, 241);

  // Créer le graphics buffer centralisé
  graphics = createGraphics(width, height);
  graphics.textAlign(CENTER, CENTER);
  graphics.fill(80);

  // Initialiser les ressources communes
  shockwave.init();

  // Initialiser les pages après setup
  for (let page of pages.values()) {
    page.init();
  }
  // Démarrer avec la MainPage
  switchTo('mainPage');
}

function draw() {
  translate(-width/2, -height/2);

  //console.log('draw')
  

  // Rendu du background commun avec shockwave
  if (shockwave?.isInitialized) {
    shockwave.beginRender(graphics);

    // La page active rend son contenu sur le buffer graphics
    if (activePage) {
      activePage.renderToGraphics(graphics);
    }

    // Finaliser avec le shader shockwave
    shockwave.endRender();
  } else {
    // Version fallback sans shader
    console.log('🧠 [DEBUG] Using fallback render (no shockwave)');
    background(244, 243, 241);
    if (activePage) {
      activePage.renderToCanvas();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (activePage) {
    activePage.onMousePressed();
  }
}

// Fonctions utilitaires exportées
function switchTo(pageName) {
  console.log('🧠 [DEBUG] switchTo(' + pageName + ')');

  // Masquer la page actuelle
  if (activePage) {
    console.log('🧠 [DEBUG] Hiding current page:', activePage.constructor.name);
    activePage.hide();
  }

  // Activer la nouvelle page
  activePage = pages.get(pageName);
  if (activePage) {
    console.log('🧠 [DEBUG] Showing new page:', activePage.constructor.name);
    activePage.show();
  } else {
    console.log('🧠 [ERROR] Page not found:', pageName);
  }
}

function getShockwave() {
  return shockwave;
}

function getGraphics() {
  return graphics;
}

// Exposer les fonctions globalement pour les pages
window.switchTo = switchTo;
window.getShockwave = getShockwave;
window.getGraphics = getGraphics;

// p5.js détecte automatiquement les fonctions globales
// Le canvas est attaché au conteneur via canvas.parent() dans setup()
// PLUS BESOIN de new p5() - p5.js trouve les fonctions globales automatiquement

console.log('🧠 Brain initialized with global p5.js functions');