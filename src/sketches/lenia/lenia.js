import { CONFIG } from './config.js';
import { createFPSCounter, updateFPS, drawFPS } from './fps-counter.js';

export const Lenia = (p) => {
  let canvas;
  let fpsData = createFPSCounter();
  let shaderObj;
  let fontObj;

  p.preload = () => {
    // charge la font
    fontObj = p.loadFont('assets/fonts/CourierPrime-Regular.ttf');

    // Charge les shaders externes
    shaderObj = p.loadShader(
      'assets/glsl/lenia.vert',
      'assets/glsl/lenia.frag'
    );
  };

  p.setup = () => {
    const containerElement = document.getElementById('lenia-container');
    if (!containerElement) {
      console.error('❌ Container #lenia-container non trouvé');
      return;
    }
    const { offsetWidth: w, offsetHeight: h } = containerElement;
    canvas = p.createCanvas(w, h, p.WEBGL);
    canvas.parent('lenia-container');
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    p.noStroke();
    p.textFont(fontObj);
  };

  p.draw = () => {
    p.background(20, 20, 30);
    p.shader(shaderObj);
    p.rect(-p.width / 2, -p.height / 2, p.width, p.height); // plein écran


    // Affichage FPS
    // if (CONFIG.fps.show) {
    //   updateFPS(p, fpsData);
    //   drawFPS(p, fpsData.currentFPS);
    // }
  };
};