/**
 * Particle System - Interactive canvas with 200 particles
 * Features: physics simulation, mouse interaction, FPS counter
 */

// Particle system configuration
const CONFIG = {
  particleCount: 200,
  maxConnections: 80,
  connectionOpacity: 50,
  colors: ['#E84420', '#F4CD00', '#3E58E2', '#F1892A', '#22A722', '#7F3CAC', '#F391C7', '#3DC1A2'],
  physics: {
    maxSpeed: 0.8,
    damping: 0.8,
    floatAmplitude: 0.3,
    floatSpeed: 0.008
  },
  fps: {
    show: true,
    updateInterval: 20, // Mise à jour toutes les 10 frames
    backgroundColor: [0, 0, 0, 150],
    textColor: [255, 255, 255],
    fontSize: 12,
    padding: 8
  }
};

let particles = [];
let canvas;

// Variables FPS
let fpsCounter = 0;
let currentFPS = 0;
let lastFPSUpdate = 0;

/**
 * Initialisation du système p5.js
 */
function setup() {
  console.log('🎨 Initialisation du système de particules...');
  
  if (!initializeCanvas()) return;
  initializeParticles();
  
  console.log(`✅ ${particles.length} particules créées dans un cadre ${width}x${height}`);
}

/**
 * Initialise le canvas dans le container HTML
 * @returns {boolean} Succès de l'initialisation
 */
function initializeCanvas() {
  const container = select('#particles-container');
  if (!container) {
    console.error('❌ Container #particles-container non trouvé');
    return false;
  }
  
  const containerElement = document.getElementById('particles-container');
  const { offsetWidth: w, offsetHeight: h } = containerElement;
  
  canvas = createCanvas(w, h);
  canvas.parent('particles-container');
  canvas.style('position', 'absolute');
  canvas.style('top', '0');
  canvas.style('left', '0');
  
  return true;
}

/**
 * Crée les particules initiales
 */
function initializeParticles() {
  particles = [];
  
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(createParticle());
  }
}

/**
 * Factory pour créer une particule
 * @param {number} x Position X (optionnelle)
 * @param {number} y Position Y (optionnelle)
 * @returns {Object} Nouvelle particule
 */
function createParticle(x, y) {
  return {
    x: x ?? random(width),
    y: y ?? random(height),
    vx: random(-CONFIG.physics.maxSpeed, CONFIG.physics.maxSpeed),
    vy: random(-CONFIG.physics.maxSpeed, CONFIG.physics.maxSpeed),
    size: random(2, 6),
    opacity: random(100, 200),
    color: random(CONFIG.colors),
    phase: random(TWO_PI),
    life: random(0.5, 1.0)
  };
}

/**
 * Boucle d'animation principale p5.js
 */
function draw() {
  // Dessiner uniquement les particules normales (le terrain a sa propre instance)
  background(249, 249, 249, 20); // Fond avec traînée
  
  // Vérifier la taille du canvas toutes les 60 frames
  if (frameCount % 60 === 0) {
    checkCanvasSize();
  }
  
  particles.forEach(particle => {
    updateParticle(particle);
    drawParticle(particle);
    drawConnections(particle);
  });
  
  // Afficher les FPS
  if (CONFIG.fps.show) {
    updateFPS();
    drawFPS();
  }
}

/**
 * Met à jour la physique d'une particule
 * @param {Object} p Particule à mettre à jour
 */
function updateParticle(p) {
  // Mouvement avec flottement organique
  const floatX = sin(frameCount * CONFIG.physics.floatSpeed + p.phase) * CONFIG.physics.floatAmplitude;
  const floatY = cos(frameCount * CONFIG.physics.floatSpeed * 1.5 + p.phase) * 0.2;
  
  p.x += p.vx + floatX;
  p.y += p.vy + floatY;
  
  // Rebonds sur les bords avec amortissement
  handleBoundaryCollisions(p);
  
  // Animation de vie (variation d'opacité)
  p.life += sin(frameCount * 0.01 + p.phase) * 0.002;
  p.life = constrain(p.life, 0.3, 1.0);
}

/**
 * Gère les collisions avec les bords
 * @param {Object} p Particule
 */
function handleBoundaryCollisions(p) {
  const margin = 5;
  
  if (p.x > width - margin || p.x < margin) {
    p.vx *= -CONFIG.physics.damping;
    p.x = constrain(p.x, margin, width - margin);
  }
  
  if (p.y > height - margin || p.y < margin) {
    p.vy *= -CONFIG.physics.damping;
    p.y = constrain(p.y, margin, height - margin);
  }
}

/**
 * Dessine une particule
 * @param {Object} p Particule à dessiner
 */
function drawParticle(p) {
  const alpha = p.opacity * p.life;
  const col = color(p.color);
  
  fill(red(col), green(col), blue(col), alpha);
  noStroke();
  ellipse(p.x, p.y, p.size);
}

/**
 * Dessine les connexions entre particules proches
 * @param {Object} particle Particule de référence
 */
function drawConnections(particle) {
  particles.forEach(other => {
    if (other === particle) return;
    
    const distance = dist(particle.x, particle.y, other.x, other.y);
    
    if (distance < CONFIG.maxConnections && distance > 0) {
      const alpha = map(distance, 0, CONFIG.maxConnections, CONFIG.connectionOpacity, 0);
      stroke(100, 100, 100, alpha);
      strokeWeight(0.5);
      line(particle.x, particle.y, other.x, other.y);
    }
  });
}

/**
 * Redimensionnement adaptatif du canvas
 */
function windowResized() {
  resizeCanvasToContainer();
}

/**
 * Redimensionne le canvas aux dimensions actuelles du container
 */
function resizeCanvasToContainer() {
  const containerElement = document.getElementById('particles-container');
  if (!containerElement) return;
  
  const { offsetWidth: w, offsetHeight: h } = containerElement;
  resizeCanvas(w, h);
  console.log('🔄 Canvas redimensionné:', w, h);
}

/**
 * Vérifie si le canvas a la bonne taille et le redimensionne si nécessaire
 */
function checkCanvasSize() {
  const containerElement = document.getElementById('particles-container');
  if (!containerElement) return;
  
  const { offsetWidth: w, offsetHeight: h } = containerElement;
  
  // Si la taille a changé, redimensionner
  if (width !== w || height !== h) {
    resizeCanvas(w, h);
    console.log('🔄 Auto-resize canvas:', w, h);
  }
}

/**
 * Interaction souris - Ajouter des particules au clic
 */
function mousePressed() {
  if (!isMouseInCanvas()) return;
  
  addInteractiveParticles(mouseX, mouseY);
  limitParticleCount();
}

/**
 * Vérifie si la souris est dans le canvas
 * @returns {boolean}
 */
function isMouseInCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

/**
 * Ajoute des particules interactives à une position
 * @param {number} x Position X
 * @param {number} y Position Y
 */
function addInteractiveParticles(x, y) {
  const count = 5;
  const spread = 20;
  
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(
      x + random(-spread, spread),
      y + random(-spread, spread)
    ));
  }
}

/**
 * Limite le nombre total de particules
 */
function limitParticleCount() {
  const maxParticles = CONFIG.particleCount * 2;
  
  if (particles.length > maxParticles) {
    particles.splice(0, 5);
  }
}

/**
 * Met à jour le compteur FPS
 */
function updateFPS() {
  fpsCounter++;
  
  // Mettre à jour le FPS affiché toutes les N frames
  if (frameCount - lastFPSUpdate >= CONFIG.fps.updateInterval) {
    currentFPS = Math.round(frameRate());
    lastFPSUpdate = frameCount;
  }
}

/**
 * Dessine l'affichage FPS en bas à droite
 */
function drawFPS() {
  const { fontSize, padding, backgroundColor, textColor } = CONFIG.fps;
  
  // Texte à afficher
  const fpsText = `${currentFPS} FPS`;
  
  // Configuration du texte
  textSize(fontSize);
  textFont('monospace');
  
  // Calculer les dimensions (estimation fixe pour éviter le conflit textWidth)
  const estimatedWidth = fpsText.length * fontSize * 0.6; // Approximation pour monospace
  const textHeight = fontSize;
  
  // Position en bas à droite
  const boxWidth = estimatedWidth + padding * 2;
  const boxHeight = textHeight + padding * 2;
  const x = width - boxWidth - 5;
  const y = height - boxHeight - 5;
  
  // Dessiner le fond semi-transparent
  fill(...backgroundColor);
  noStroke();
  rect(x, y, boxWidth, boxHeight, 3);
  
  // Dessiner le texte
  fill(...textColor);
  textAlign(LEFT, TOP);
  text(fpsText, x + padding, y + padding);
}

/**
 * Permet de toggle l'affichage FPS avec la touche 'F'
 */
function keyPressed() {
  if (key === 'f' || key === 'F') {
    CONFIG.fps.show = !CONFIG.fps.show;
    console.log(`📊 FPS display: ${CONFIG.fps.show ? 'ON' : 'OFF'}`);
  }
}