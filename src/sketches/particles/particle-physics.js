// Physique et mouvement des particules
import { CONFIG } from './config.js';

export function updateParticle(p, particle) {
  const floatX = p.sin(p.frameCount * CONFIG.physics.floatSpeed + particle.phase) * CONFIG.physics.floatAmplitude;
  const floatY = p.cos(p.frameCount * CONFIG.physics.floatSpeed * 1.5 + particle.phase) * 0.2;
  particle.x += particle.vx + floatX;
  particle.y += particle.vy + floatY;
  handleBoundaryCollisions(p, particle);
  particle.life += p.sin(p.frameCount * 0.01 + particle.phase) * 0.002;
  particle.life = p.constrain(particle.life, 0.3, 1.0);
}

export function handleBoundaryCollisions(p, particle) {
  const margin = 5;
  if (particle.x > p.width - margin || particle.x < margin) {
    particle.vx *= -CONFIG.physics.damping;
    particle.x = p.constrain(particle.x, margin, p.width - margin);
  }
  if (particle.y > p.height - margin || particle.y < margin) {
    particle.vy *= -CONFIG.physics.damping;
    particle.y = p.constrain(particle.y, margin, p.height - margin);
  }
}