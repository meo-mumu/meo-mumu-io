
// Export instance mode sketch
export const sketchParticles = (p) => {
  // Particle system configuration
  const CONFIG = {
    particleCount: 200,
    maxConnections: 80,
    connectionOpacity: 50,
    colors: ['#E84420', '#F4CD00', '#3E58E2', '#F1892A', '#22A722', '#7F3CAC', '#F391C7', '#3DC1A2'],
    physics: {
      maxSpeed: 0.8,
      damping: 0.8,
      floatAmplitude: 0.3,
      floatSpeed: 0.008
    },
    fps: {
      show: true,
      updateInterval: 20,
      backgroundColor: [0, 0, 0, 150],
      textColor: [255, 255, 255],
      fontSize: 12,
      padding: 8
    }
  };

  let particles = [];
  let canvas;
  let fpsCounter = 0;
  let currentFPS = 0;
  let lastFPSUpdate = 0;

  p.setup = () => {
    // Initialisation du système de particules
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
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(createParticle());
    }
    console.log(`✅ ${particles.length} particules créées dans un cadre ${w}x${h}`);
  };

  function createParticle(x, y) {
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

  p.draw = () => {
    p.background(249, 249, 249, 20);
    if (p.frameCount % 60 === 0) {
      checkCanvasSize();
    }
    particles.forEach(particle => {
      updateParticle(particle);
      drawParticle(particle);
      drawConnections(particle);
    });
    if (CONFIG.fps.show) {
      updateFPS();
      drawFPS();
    }
    if (window.LeniaSystem && window.LeniaSystem.isActive()) {
      window.LeniaSystem.update();
    }
  };

  function updateParticle(p) {
    const floatX = p5sin(p, p.frameCount * CONFIG.physics.floatSpeed + p.phase) * CONFIG.physics.floatAmplitude;
    const floatY = p5cos(p, p.frameCount * CONFIG.physics.floatSpeed * 1.5 + p.phase) * 0.2;
    p.x += p.vx + floatX;
    p.y += p.vy + floatY;
    handleBoundaryCollisions(p);
    p.life += p5sin(p, p.frameCount * 0.01 + p.phase) * 0.002;
    p.life = p.constrain(p.life, 0.3, 1.0);
  }

  function handleBoundaryCollisions(particle) {
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

  function drawParticle(particle) {
    const alpha = particle.opacity * particle.life;
    const col = p.color(particle.color);
    p.fill(p.red(col), p.green(col), p.blue(col), alpha);
    p.noStroke();
    p.ellipse(particle.x, particle.y, particle.size);
  }

  function drawConnections(particle) {
    particles.forEach(other => {
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

  p.windowResized = () => {
    resizeCanvasToContainer();
  };

  function resizeCanvasToContainer() {
    const containerElement = document.getElementById('particles-container');
    if (!containerElement) return;
    const { offsetWidth: w, offsetHeight: h } = containerElement;
    p.resizeCanvas(w, h);
    console.log('🔄 Canvas redimensionné:', w, h);
  }

  function checkCanvasSize() {
    const containerElement = document.getElementById('particles-container');
    if (!containerElement) return;
    const { offsetWidth: w, offsetHeight: h } = containerElement;
    if (p.width !== w || p.height !== h) {
      p.resizeCanvas(w, h);
      console.log('🔄 Auto-resize canvas:', w, h);
    }
  }

  p.mousePressed = () => {
    if (!isMouseInCanvas()) return;
    addInteractiveParticles(p.mouseX, p.mouseY);
    limitParticleCount();
  };

  function isMouseInCanvas() {
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  }

  function addInteractiveParticles(x, y) {
    const count = 5;
    const spread = 20;
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(
        x + p.random(-spread, spread),
        y + p.random(-spread, spread)
      ));
    }
  }

  function limitParticleCount() {
    const maxParticles = CONFIG.particleCount * 2;
    if (particles.length > maxParticles) {
      particles.splice(0, 5);
    }
  }

  function updateFPS() {
    fpsCounter++;
    if (p.frameCount - lastFPSUpdate >= CONFIG.fps.updateInterval) {
      currentFPS = Math.round(p.frameRate());
      lastFPSUpdate = p.frameCount;
    }
  }

  function drawFPS() {
    const { fontSize, padding, backgroundColor, textColor } = CONFIG.fps;
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

  p.keyPressed = () => {
    if (p.key === 'f' || p.key === 'F') {
      CONFIG.fps.show = !CONFIG.fps.show;
      console.log(`📊 FPS display: ${CONFIG.fps.show ? 'ON' : 'OFF'}`);
    }
  };

  // Helper for sin/cos in instance mode
  function p5sin(p, val) { return p.sin(val); }
  function p5cos(p, val) { return p.cos(val); }
};