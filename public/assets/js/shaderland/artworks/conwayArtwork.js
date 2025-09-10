/**
 * Conway Artwork - Conway's Game of Life
 * Based on conwayshader.js from backup
 */
window.ConwayArtwork = {
  sketch: function(p) {
    let shaderObj;
    let prevFrame;
    
    p.preload = () => {
      shaderObj = p.loadShader('assets/glsl/main-v1.vert', 'assets/glsl/conway.frag');
    };
    
    p.setup = () => {
      const container = document.getElementById('sl-artwork-canvas');
      const size = Math.min(container.clientWidth, container.clientHeight);
      
      p.noStroke();
      p.createCanvas(size, size, p.WEBGL);
      p.pixelDensity(1);
      p.noSmooth();

      prevFrame = p.createGraphics(p.width, p.height);
      prevFrame.pixelDensity(1);
      prevFrame.noSmooth();

      p.background(0);
      p.stroke(255); 
      p.strokeWeight(1);
      p.shader(shaderObj);
      shaderObj.setUniform("normalRes", [1.0/p.width, 1.0/p.height]);
      
      // Initialize with some random cells
      initializeConway();
    };
    
    p.draw = () => {
      // On place les nouvelles cellules si mouse pressed
      if (p.mouseIsPressed && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        p.line(
          p.pmouseX - p.width / 2,
          p.pmouseY - p.height / 2,
          p.mouseX - p.width / 2,
          p.mouseY - p.height / 2
        );
      }

      // On envoie la frame précédente au shader
      prevFrame.image(p.get(), 0, 0);
      shaderObj.setUniform('tex', prevFrame);

      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
    };
    
    p.keyPressed = () => {
      if (p.key === 'r' || p.key === 'R') {
        initializeConway();
      }
    };
    
    function initializeConway() {
      p.background(0);
      p.stroke(255);
      p.strokeWeight(2);
      
      // Add some initial random patterns
      for (let i = 0; i < 50; i++) {
        let x = p.random(-p.width/2, p.width/2);
        let y = p.random(-p.height/2, p.height/2);
        p.point(x, y);
      }
    }
  }
};