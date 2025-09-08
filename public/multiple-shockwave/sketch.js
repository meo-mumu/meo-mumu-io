let shockWaveShader;
let graphics;

const NUM_SHOCKWAVES = 10;

let centres = new Array(NUM_SHOCKWAVES);
let times = new Array(NUM_SHOCKWAVES);

// load in the shader
function preload() {
  shockWaveShader = loadShader('shock.vert', 'shock.frag');
}

function setup() {
  createCanvas(800, 800, WEBGL);
  shader(shockWaveShader);
  
  graphics = createGraphics(width, height);
  
  graphics.background("#264653");
  graphics.fill("#2a9d8f");
  graphics.noStroke();
  const s = 40;
  for(let i = 0; i < width/s; i ++) {
    for(let j = 0; j < height/s; j ++) {
      if((i + j) % 2 == 0) {
        continue;
      }
      graphics.square(i * s, j * s, s);
    }
  }
    
  graphics.textSize(100);
  graphics.stroke("#e76f51");
  graphics.fill("#f4a261");
  graphics.strokeWeight(5);
  graphics.textAlign(CENTER, CENTER);
  graphics.text("MORE\nSHOCKWAVES!", width/2, height/2);
  
  
  for(let i = 0; i < NUM_SHOCKWAVES; i ++) {
    centres[i] = [0, 0];
    times[i] = 1;
  }
}

function draw() {
  
  shockWaveShader.setUniform("image", graphics);
  shockWaveShader.setUniform("aspect", [1, width/height]);
  
  let centresUniform = [];
  let timesUniform = [];
  for(let i = 0; i < NUM_SHOCKWAVES; i ++) {
    if(times[i] < 1) {
      times[i] += 0.02;
    }
    centresUniform = centresUniform.concat(centres[i]);
    timesUniform.push(pow(times[i], 1/1.5));
  }
    
  shockWaveShader.setUniform("centres", centresUniform);
  shockWaveShader.setUniform("times", timesUniform);
    
  clear();
  rect(-width/2, -height/2, width, height);
}

function mouseReleased() {
  setCentreToMouse();
}

function setCentreToMouse() {
  // remove old shockwave data
  centres.shift(); 
  times.shift();
  
  // add new one to back
  centres.push([mouseX/width, mouseY/height]);
  times.push(0);
}


