/**
 * Flower Artwork - Flowing flower patterns
 * Based on flower.frag from backup
 */
window.FlowerArtwork = {
  sketch: function(p) {
    let shaderObj;
    
    p.preload = () => {
      shaderObj = p.loadShader('assets/glsl/main.vert', 'assets/glsl/flower.frag');
    };
    
    p.setup = () => {
      const container = document.getElementById('sl-artwork-canvas');
      const size = Math.min(container.clientWidth, container.clientHeight);
      
      p.noStroke();
      p.createCanvas(size, size, p.WEBGL);
      p.pixelDensity(1);
      
      p.shader(shaderObj);
      shaderObj.setUniform("u_widht", p.width);
      shaderObj.setUniform("u_height", p.height);
    };
    
    p.draw = () => {
      // Static flower pattern - no animation needed for this one
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
    };
    
    p.windowResized = () => {
      const container = document.getElementById('sl-artwork-canvas');
      const size = Math.min(container.clientWidth, container.clientHeight);
      p.resizeCanvas(size, size);
      shaderObj.setUniform("u_widht", p.width);
      shaderObj.setUniform("u_height", p.height);
    };
  }
};