// Module principal pour les shaders interactifs
import { initExpandable } from '../../../src/ui/expandable.js';
import { initBulletColorizer } from '../../../src/ui/bullet-colorizer.js';
import { animateCVSections } from '../../../src/ui/animation-cv.js';

class ShaderCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl');
    this.program = null;
    this.vertexBuffer = null;
    this.texCoordBuffer = null;
    
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }
    
    this.init();
  }
  
  async init() {
    this.setupCanvas();
    await this.loadShaders();
    this.setupBuffers();
    this.setupEventListeners();
    this.render();
  }
  
  setupCanvas() {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  
  async loadShaders() {
    const vertexShaderSource = await fetch('/assets/glsl/main.vert').then(r => r.text());
    const fragmentShaderSource = await fetch('/assets/glsl/main.frag').then(r => r.text());
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Erreur compilation shader:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Erreur linking program:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }
  
  setupBuffers() {
    // Vertices pour un quad plein écran
    const vertices = new Float32Array([
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0,  1.0, 0.0
    ]);
    
    // Coordonnées de texture
    const texCoords = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ]);
    
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1.0 - (event.clientY - rect.top) / rect.height; // Flip Y
      
      this.handleClick(x, y);
    });
  }
  
  handleClick(x, y) {
    // Zone rouge (gauche)
    if (x < 0.5) {
      console.log('Click sur zone rouge - redirection vers /my-shader');
      window.location.href = '/my-shader';
    }
    // Zone bleue (droite)
    else {
      console.log('Click sur zone bleue - affichage mini CV');
      this.showMiniCV();
    }
  }
  
  showMiniCV() {
    const overlay = document.getElementById('cv-overlay');
    overlay.classList.remove('hidden');
    
    // Initialiser les composants UI du CV après affichage
    setTimeout(() => {
      initExpandable();
      initBulletColorizer();
      animateCVSections();
    }, 100);
  }
  
  render() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Bind position attribute
    const positionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
    
    // Bind texture coordinate attribute
    const texCoordLocation = this.gl.getAttribLocation(this.program, 'aTexCoord');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    
    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}

// Initialisation
window.addEventListener('DOMContentLoaded', () => {
  const shaderCanvas = new ShaderCanvas('shader-canvas');
  
  // Gestion de la fermeture du mini CV
  const closeBtn = document.getElementById('close-cv');
  const overlay = document.getElementById('cv-overlay');
  
  closeBtn?.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });
  
  // Fermeture en cliquant sur l'overlay
  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.classList.add('hidden');
    }
  });
  
  console.log('✅ Shader canvas initialisé');
});