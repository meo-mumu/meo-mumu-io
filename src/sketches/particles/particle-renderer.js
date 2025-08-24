// Rendu des particules et connexions
import { CONFIG } from './config.js';

export function drawParticle(p, particle) {
  const alpha = particle.opacity * particle.life;
  const col = p.color(particle.color);
  p.fill(p.red(col), p.green(col), p.blue(col), alpha);
  p.noStroke();
  p.ellipse(particle.x, particle.y, particle.size);
}

export function drawConnections(p, particle, allParticles) {
  allParticles.forEach(other => {
    if (other === particle) return;
    const distance = p.dist(particle.x, particle.y, other.x, other.y);
    if (distance < CONFIG.maxConnections && distance > 0) {
      const alpha = p.map(distance, 0, CONFIG.maxConnections, CONFIG.connectionOpacity, 0);
      p.stroke(100, 100, 100, alpha);
      p.strokeWeight(0.5);
      p.line(particle.x, particle.y, other.x, other.y);
    }
  });
}