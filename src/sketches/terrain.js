// Sketch p5.js - Terrain Perlin
// Sketch p5.js - Terrain Perlin (modularisé)
export const Terrain = (p) => {
  // Terrain configuration
  const TERRAIN_CONFIG = {
    particleCount: 3000,
    colors: {
      green: '#8FBC8F',
      gray: '#D3D3D3',
      darkGreen: '#6B8E6B',
      lightGray: '#E8E8E8'
    },
    terrain: {
      noiseScale: 0.005,
      amplitude: 80,
      speed: 0.002,
      layers: 3
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
  let noiseOffset = 0;
  let fpsCounter = 0;
  let currentFPS = 0;
  let lastFPSUpdate = 0;

  p.setup = () => {
    const container = document.getElementById('terrain-container');
    if (!container) {
      console.error('❌ Container #terrain-container non trouvé');
      return;
    }
    const { offsetWidth: w, offsetHeight: h } = container;
    const canvas = p.createCanvas(w, h);
    canvas.parent('terrain-container');
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    initTerrainParticles(w, h);
    noiseOffset = 0;
    fpsCounter = 0;
    currentFPS = 0;
    lastFPSUpdate = 0;
    console.log(`✅ Terrain créé: ${TERRAIN_CONFIG.particleCount} particules dans ${w}x${h}`);
  };

  function initTerrainParticles(w, h) {
    terrainParticles = [];
    const cols = Math.floor(Math.sqrt(TERRAIN_CONFIG.particleCount * (w / h)));
    const rows = Math.floor(TERRAIN_CONFIG.particleCount / cols);
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        terrainParticles.push({
          x: p.map(x, 0, cols - 1, 0, w),
          y: p.map(y, 0, rows - 1, 0, h),
          baseY: p.map(y, 0, rows - 1, 0, h),
          noiseOffsetX: x * 0.1,
          noiseOffsetY: y * 0.1,
          layer: Math.floor(y / (rows / TERRAIN_CONFIG.terrain.layers)),
          size: p.random(1, 3)
        });
      }
    }
  }

  p.draw = () => {
    for (let i = 0; i <= p.height; i++) {
      const alpha = p.map(i, 0, p.height, 0.1, 0.3);
      p.stroke(200, 220, 200, alpha * 255);
      p.line(0, i, p.width, i);
    }
    noiseOffset += TERRAIN_CONFIG.terrain.speed;
    for (let layer = 0; layer < TERRAIN_CONFIG.terrain.layers; layer++) {
      drawTerrainLayer(layer, noiseOffset);
    }
    if (TERRAIN_CONFIG.fps.show) {
      updateFPS();
      drawFPS();
    }
  };

  function drawTerrainLayer(layerIndex, noiseOffset) {
    const layerParticles = terrainParticles.filter(particle => particle.layer === layerIndex);
    const layerDepth = layerIndex / (TERRAIN_CONFIG.terrain.layers - 1);
    let layerColor;
    if (layerDepth < 0.3) {
      layerColor = p.color(TERRAIN_CONFIG.colors.lightGray);
    } else if (layerDepth < 0.7) {
      layerColor = p.color(TERRAIN_CONFIG.colors.gray);
    } else {
      layerColor = layerIndex % 2 === 0 ? p.color(TERRAIN_CONFIG.colors.green) : p.color(TERRAIN_CONFIG.colors.darkGreen);
    }
    p.fill(layerColor);
    p.noStroke();
    layerParticles.forEach(particle => {
      const noiseValue = p.noise(
        (particle.x + noiseOffset) * TERRAIN_CONFIG.terrain.noiseScale,
        (particle.baseY + noiseOffset) * TERRAIN_CONFIG.terrain.noiseScale,
        layerIndex * 0.1
      );
      const terrainHeight = noiseValue * TERRAIN_CONFIG.terrain.amplitude;
      const finalY = particle.baseY - terrainHeight + layerIndex * 20;
      const alpha = p.map(layerDepth, 0, 1, 0.4, 0.8);
      p.fill(p.red(layerColor), p.green(layerColor), p.blue(layerColor), alpha * 255);
      p.ellipse(particle.x, finalY, particle.size);
    });
  }

  function updateFPS() {
    fpsCounter++;
    if (p.frameCount - lastFPSUpdate >= TERRAIN_CONFIG.fps.updateInterval) {
      currentFPS = Math.round(p.frameRate());
      lastFPSUpdate = p.frameCount;
    }
  }

  function drawFPS() {
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

  p.windowResized = () => {
    const container = document.getElementById('terrain-container');
    if (!container) return;
    const { offsetWidth: w, offsetHeight: h } = container;
    p.resizeCanvas(w, h);
    initTerrainParticles(w, h);
    console.log('🔄 Terrain redimensionné:', w, h);
  };
};
