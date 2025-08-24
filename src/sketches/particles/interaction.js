// Interactions utilisateur (souris, clavier)
import { CONFIG } from './config.js';
import { createParticle } from './particle-factory.js';

export function isMouseInCanvas(p) {
  return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
}

export function addInteractiveParticles(p, x, y, particles) {
  const count = 5;
  const spread = 20;
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(
      p,
      x + p.random(-spread, spread),
      y + p.random(-spread, spread)
    ));
  }
}

export function limitParticleCount(particles) {
  const maxParticles = CONFIG.particleCount * 2;
  if (particles.length > maxParticles) {
    particles.splice(0, 5);
  }
}

export function handleKeyPress(key) {
  if (key === 'f' || key === 'F') {
    CONFIG.fps.show = !CONFIG.fps.show;
    console.log(`📊 FPS display: ${CONFIG.fps.show ? 'ON' : 'OFF'}`);
  }
}