export const Mainshader = (p) => {
  let shaderObj;
  const NUM_SHOCKWAVES = 10;
  let centres = Array(NUM_SHOCKWAVES).fill([0.5, 0.5]);
  let times = Array(NUM_SHOCKWAVES).fill(1);

  p.preload = () => {
    shaderObj = p.loadShader(
      'assets/glsl/main.vert',
      'assets/glsl/particles-bg.frag'
    );
  };

  p.setup = () => {
    p.noStroke();
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL).parent('mainshader-container');
    p.background(245, 235, 220, 255);
    p.shader(shaderObj);
    shaderObj.setUniform("u_resolution", [p.width, p.height]);
    shaderObj.setUniform("u_time", 0);
    shaderObj.setUniform("centres", centres.flat());
    shaderObj.setUniform("times", times);
  };

  p.draw = () => {
    // Avance les shockwaves
    for (let i = 0; i < NUM_SHOCKWAVES; i++) {
      if (times[i] < 1) times[i] += 0.02;
    }
    shaderObj.setUniform("u_time", p.millis() * 0.001);
    shaderObj.setUniform("centres", centres.flat());
    shaderObj.setUniform("times", times);
    p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
  };

  p.mousePressed = () => {
    // Ajoute une nouvelle shockwave
    centres.shift();
    times.shift();
    centres.push([p.mouseX / p.width, 1.0 - p.mouseY / p.height]);
    times.push(0);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    shaderObj.setUniform("u_resolution", [p.width, p.height]);
  };
};