// Point d'entrée principal du système de particules
import { CONFIG } from './config.js';
import { createParticle } from './particle-factory.js';
import { updateParticle } from './particle-physics.js';
import { drawParticle, drawConnections } from './particle-renderer.js';
import { resizeCanvasToContainer, checkCanvasSize } from './canvas-manager.js';
import { isMouseInCanvas, addInteractiveParticles, limitParticleCount, handleKeyPress } from './interaction.js';
import { createFPSCounter, updateFPS, drawFPS } from './fps-counter.js';

export const Particles = (p) => {
  let particles = [];
  let canvas;
  let fpsData = createFPSCounter();

  p.setup = () => {
    const containerElement = document.getElementById('particles-container');
    if (!containerElement) {
      console.error('❌ Container #particles-container non trouvé');
      return;
    }
    const { offsetWidth: w, offsetHeight: h } = containerElement;
    canvas = p.createCanvas(w, h);
    canvas.parent('particles-container');
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    
    // Initialiser les particules
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(createParticle(p));
    }
    console.log(`✅ ${particles.length} particules créées dans un cadre ${w}x${h}`);
  };

  p.draw = () => {
    p.background(249, 249, 249, 20);
    
    // Vérifier la taille du canvas périodiquement
    if (p.frameCount % 60 === 0) {
      checkCanvasSize(p);
    }
    
    // Mettre à jour et dessiner toutes les particules
    particles.forEach(particle => {
      updateParticle(p, particle);
      drawParticle(p, particle);
      drawConnections(p, particle, particles);
    });
    
    // Affichage FPS
    if (CONFIG.fps.show) {
      updateFPS(p, fpsData);
      drawFPS(p, fpsData.currentFPS);
    }
  };

  p.windowResized = () => {
    resizeCanvasToContainer(p);
  };

  p.mousePressed = () => {
    if (!isMouseInCanvas(p)) return;
    addInteractiveParticles(p, p.mouseX, p.mouseY, particles);
    limitParticleCount(particles);
  };

  p.keyPressed = () => {
    handleKeyPress(p.key);
  };
};