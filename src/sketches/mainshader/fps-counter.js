// Compteur et affichage FPS
import { CONFIG } from './config.js';

export function createFPSCounter() {
  return {
    counter: 0,
    currentFPS: 0,
    lastUpdate: 0
  };
}

export function updateFPS(p, fpsData) {
  fpsData.counter++;
  if (p.frameCount - fpsData.lastUpdate >= CONFIG.fps.updateInterval) {
    fpsData.currentFPS = Math.round(p.frameRate());
    fpsData.lastUpdate = p.frameCount;
  }
}

export function drawFPS(p, currentFPS) {
  const { fontSize, padding, backgroundColor, textColor } = CONFIG.fps;
  const fpsText = `${currentFPS} FPS`;
  p.textSize(fontSize);
  // p.textFont('monospace');
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