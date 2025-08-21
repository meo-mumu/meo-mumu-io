/**
 * Terrain Generator - Perlin noise landscape with 3000 particles
 * Features: multi-layer terrain, real-time animation, separate p5.js instance
 */

// Terrain configuration
const TERRAIN_CONFIG = {
  particleCount: 3000,
  colors: {
    green: '#8FBC8F',      // Vert pastel
    gray: '#D3D3D3',       // Gris clair
    darkGreen: '#6B8E6B',  // Vert plus foncé
    lightGray: '#E8E8E8'   // Gris très clair
  },
  terrain: {
    noiseScale: 0.005,     // Échelle du bruit de Perlin
    amplitude: 80,         // Amplitude des collines
    speed: 0.002,          // Vitesse d'animation
    layers: 3              // Nombre de couches de terrain
  },
  fps: {
    show: true,
    updateInterval: 10,
    backgroundColor: [0, 0, 0, 150],
    textColor: [255, 255, 255],
    fontSize: 12,
    padding: 8
  }
};

let terrainParticles = [];
let terrainCanvas;
let terrainNoiseOffset = 0;

// Variables FPS pour le terrain
let terrainFpsCounter = 0;
let terrainCurrentFPS = 0;
let terrainLastFPSUpdate = 0;

/**
 * Setup du terrain avec instance p5.js séparée
 */
function setupTerrain() {
  console.log('🏔️ Initialisation du terrain Perlin...');
  
  const container = document.getElementById('terrain-container');
  if (!container) {
    console.error('❌ Container #terrain-container non trouvé');
    return;
  }
  
  // Créer une instance p5.js séparée pour le terrain
  if (window.terrainP5Instance) {
    window.terrainP5Instance.remove(); // Nettoyer l'ancienne instance
  }
  
  window.terrainP5Instance = new p5((p) => {
    let localTerrainParticles = [];
    let noiseOffset = 0;
    
    // Variables FPS locales
    let fpsCounter = 0;
    let currentFPS = 0;
    let lastFPSUpdate = 0;
    
    p.setup = () => {
      const { offsetWidth: w, offsetHeight: h } = container;
      const canvas = p.createCanvas(w, h);
      canvas.parent('terrain-container');
      canvas.style('position', 'absolute');
      canvas.style('top', '0');
      canvas.style('left', '0');
      
      // Initialiser les particules
      initLocalTerrainParticles(p, localTerrainParticles);
      console.log(`✅ Terrain créé: ${TERRAIN_CONFIG.particleCount} particules dans ${w}x${h}`);
    };
    
    p.draw = () => {
      // Fond dégradé subtil
      for (let i = 0; i <= p.height; i++) {
        const alpha = p.map(i, 0, p.height, 0.1, 0.3);
        p.stroke(200, 220, 200, alpha * 255);
        p.line(0, i, p.width, i);
      }
      
      // Mettre à jour l'offset temporel
      noiseOffset += TERRAIN_CONFIG.terrain.speed;
      
      // Dessiner les particules par couches
      for (let layer = 0; layer < TERRAIN_CONFIG.terrain.layers; layer++) {
        drawLocalTerrainLayer(p, localTerrainParticles, layer, noiseOffset);
      }
      
      // Afficher FPS
      if (TERRAIN_CONFIG.fps.show) {
        const fpsData = updateLocalFPS(p, fpsCounter, currentFPS, lastFPSUpdate);
        fpsCounter = fpsData.fpsCounter;
        currentFPS = fpsData.currentFPS;
        lastFPSUpdate = fpsData.lastFPSUpdate;
        drawLocalFPS(p, currentFPS);
      }
    };
    
    p.windowResized = () => {
      const { offsetWidth: w, offsetHeight: h } = container;
      p.resizeCanvas(w, h);
      initLocalTerrainParticles(p, localTerrainParticles);
      console.log('🔄 Terrain redimensionné:', w, h);
    };
  });
}

/**
 * Initialise les particules du terrain (fonction locale)
 */
function initLocalTerrainParticles(p, particles) {
  particles.length = 0; // Vider le tableau
  
  // Créer un grille de particules
  const cols = Math.floor(Math.sqrt(TERRAIN_CONFIG.particleCount * (p.width/p.height)));
  const rows = Math.floor(TERRAIN_CONFIG.particleCount / cols);
  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      particles.push({
        x: p.map(x, 0, cols-1, 0, p.width),
        y: p.map(y, 0, rows-1, 0, p.height),
        baseY: p.map(y, 0, rows-1, 0, p.height),
        noiseOffsetX: x * 0.1,
        noiseOffsetY: y * 0.1,
        layer: Math.floor(y / (rows / TERRAIN_CONFIG.terrain.layers)),
        size: p.random(1, 3)
      });
    }
  }
}

/**
 * Dessine une couche de terrain (fonction locale)
 */
function drawLocalTerrainLayer(p, particles, layerIndex, noiseOffset) {
  const layerParticles = particles.filter(particle => particle.layer === layerIndex);
  const layerDepth = layerIndex / (TERRAIN_CONFIG.terrain.layers - 1);
  
  // Couleurs selon la profondeur
  let layerColor;
  if (layerDepth < 0.3) {
    layerColor = p.color(TERRAIN_CONFIG.colors.lightGray);
  } else if (layerDepth < 0.7) {
    layerColor = p.color(TERRAIN_CONFIG.colors.gray);
  } else {
    layerColor = layerIndex % 2 === 0 ? 
      p.color(TERRAIN_CONFIG.colors.green) : 
      p.color(TERRAIN_CONFIG.colors.darkGreen);
  }
  
  p.fill(layerColor);
  p.noStroke();
  
  layerParticles.forEach(particle => {
    // Calculer la hauteur avec bruit de Perlin
    const noiseValue = p.noise(
      (particle.x + noiseOffset) * TERRAIN_CONFIG.terrain.noiseScale,
      (particle.baseY + noiseOffset) * TERRAIN_CONFIG.terrain.noiseScale,
      layerIndex * 0.1
    );
    
    const terrainHeight = noiseValue * TERRAIN_CONFIG.terrain.amplitude;
    const finalY = particle.baseY - terrainHeight + layerIndex * 20;
    
    // Varier l'opacité selon la profondeur
    const alpha = p.map(layerDepth, 0, 1, 0.4, 0.8);
    p.fill(p.red(layerColor), p.green(layerColor), p.blue(layerColor), alpha * 255);
    
    p.ellipse(particle.x, finalY, particle.size);
  });
}

/**
 * Met à jour le compteur FPS local
 */
function updateLocalFPS(p, fpsCounter, currentFPS, lastFPSUpdate) {
  fpsCounter++;
  
  if (p.frameCount - lastFPSUpdate >= TERRAIN_CONFIG.fps.updateInterval) {
    currentFPS = Math.round(p.frameRate());
    lastFPSUpdate = p.frameCount;
  }
  return { fpsCounter, currentFPS, lastFPSUpdate };
}

/**
 * Dessine l'affichage FPS local
 */
function drawLocalFPS(p, currentFPS) {
  const { fontSize, padding, backgroundColor, textColor } = TERRAIN_CONFIG.fps;
  
  const fpsText = `${currentFPS} FPS`;
  
  p.textSize(fontSize);
  p.textFont('monospace');
  
  const estimatedWidth = fpsText.length * fontSize * 0.6;
  const textHeight = fontSize;
  
  const boxWidth = estimatedWidth + padding * 2;
  const boxHeight = textHeight + padding * 2;
  const x = p.width - boxWidth - 5;
  const y = p.height - boxHeight - 5;
  
  p.fill(...backgroundColor);
  p.noStroke();
  p.rect(x, y, boxWidth, boxHeight, 3);
  
  p.fill(...textColor);
  p.textAlign(p.LEFT, p.TOP);
  p.text(fpsText, x + padding, y + padding);
}

/**
 * Nettoie l'instance du terrain
 */
function destroyTerrain() {
  if (window.terrainP5Instance) {
    window.terrainP5Instance.remove();
    window.terrainP5Instance = null;
    console.log('🗑️ Instance terrain détruite');
  }
}

// Système de terrain global
window.TerrainSystem = {
  setup: setupTerrain,
  destroy: destroyTerrain,
  isActive: false
};