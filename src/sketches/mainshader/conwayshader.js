export const Mainshader = (p) => {
  let shaderObj;
  let prevFrame;
  

  p.preload = () => {
    shaderObj = p.loadShader(
      'assets/glsl/main.vert',
      'assets/glsl/main.frag'
    );
  };

  p.setup = () => {
    // Crée le canvas et l'attache directement au conteneur
    p.noStroke();
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL).parent('mainshader-container');
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
    shaderObj.setUniform("u_widht", p.width);
    shaderObj.setUniform("u_height", p.height);
  };

p.draw = () => {
  
  // On place les nouvelles cellules
  if (p.mouseIsPressed) {
    p.line(
      p.pmouseX - p.width / 2,
      p.pmouseY - p.height / 2,
      p.mouseX - p.width / 2,
      p.mouseY - p.height / 2
    );
  }

  // On envoie
  prevFrame.image(p.get(), 0, 0);
  shaderObj.setUniform('tex', prevFrame);

  p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
};

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
};