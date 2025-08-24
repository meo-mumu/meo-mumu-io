// Factory pour créer des particules
import { CONFIG } from './config.js';

export function createParticle(p, x, y) {
  return {
    x: x ?? p.random(p.width),
    y: y ?? p.random(p.height),
    vx: p.random(-CONFIG.physics.maxSpeed, CONFIG.physics.maxSpeed),
    vy: p.random(-CONFIG.physics.maxSpeed, CONFIG.physics.maxSpeed),
    size: p.random(2, 6),
    opacity: p.random(100, 200),
    color: p.random(CONFIG.colors),
    phase: p.random(p.TWO_PI),
    life: p.random(0.5, 1.0)
  };
}