export const Maintext = (p) => {

  let withShader = true;

  let g;
  let fonts = [];
  let showDebugCircles = false;

  let shockWaveShader;
  const NUM_SHOCKWAVES = 10;
  let centres = new Array(NUM_SHOCKWAVES);
  let times = new Array(NUM_SHOCKWAVES);

  let texts = [
    { text: "Curriculum vitae", x: 0, y: 0, sensitivities: [] },
    { text: "Soundcloud", x: 0, y: 0, sensitivities: [] },
    { text: "Shaderland", x: 0, y: 0, sensitivities: [] }
  ];

  p.preload = () => {
    fonts[0] = { 
      font: p.loadFont('assets/fonts/CourierPrime-Regular.ttf'), 
      size: 25, 
      threshold: 0.8 
    };
    fonts[1] = { 
      font: p.loadFont('assets/fonts/rune/Highschool_Runes.ttf'), 
      size: 35, 
      threshold: 0.88 
    };
    fonts[2] = { 
      font: p.loadFont('assets/fonts/rune/grace_of_etro.ttf'), 
      size: 35, 
      threshold: 0.95 
    };
    fonts[3] = { 
      font: p.loadFont('assets/fonts/rune/DARUNE.otf'), 
      size: 35, 
      threshold: 1.0 
    };
    
    shockWaveShader = p.loadShader('assets/glsl/main.vert', 'assets/glsl/shock.frag');
  };


  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL).parent('maintext-container');
    
    g = p.createGraphics(p.width, p.height);
    g.textAlign(p.CENTER, p.CENTER);
    g.fill(80); // couleur du texte
    
    // Mettre un fond par défaut au graphics buffer
    g.background(244, 243, 241); // Même couleur que le CSS
    
    let centerX = p.width / 2;
    let centerY = p.height / 2;
    let lineSpacing = 80;
    
    texts[0].x = centerX;
    texts[0].y = centerY - lineSpacing;
    
    texts[1].x = centerX;
    texts[1].y = centerY;
    
    texts[2].x = centerX;
    texts[2].y = centerY + lineSpacing;
    
    texts.forEach(textObj => {
      textObj.sensitivities = Array.from({length: textObj.text.length}, () => p.random(-0.2, 0.2));
    });

    if (withShader) {
      p.shader(shockWaveShader);
      for(let i = 0; i < NUM_SHOCKWAVES; i ++) {
        centres[i] = [0, 0];
        times[i] = 1;
      }
    }


  };

  p.draw = () => {
    p.translate(-p.width/2, -p.height/2);
    
    // Remettre le fond au graphics buffer à chaque frame
    g.background(244, 243, 241);
    p.clear();

    // Rendre chaque texte
    texts.forEach(textObj => {
      let spacing = 15;
      let startX = textObj.x - (textObj.text.length * spacing) / 2 + spacing / 2;
      
      let d = g.dist(p.mouseX, p.mouseY, textObj.x, textObj.y);
      let maxDist = Math.min(g.width, g.height) / 2;

      for (let i = 0; i < textObj.text.length; i++) {
        let letterX = startX + i * spacing;
        let letterY = textObj.y;
        let t = g.constrain((d / maxDist) + textObj.sensitivities[i], 0, 1);

        let fontIndex = fonts.findIndex(fontObj => t < fontObj.threshold);
        if (fontIndex === -1) fontIndex = fonts.length - 1;

        g.textFont(fonts[fontIndex].font);
        g.textSize(fonts[fontIndex].size);
        g.text(textObj.text[i], letterX, letterY);
      }
    });

      
    if (!withShader) {
      console.log("Rendering without shader");
      p.image(g, 0, 0); //render g dans p
    }
    else {
      console.log("Rendering with shader");
      shockWaveShader.setUniform("image", g);
      shockWaveShader.setUniform("aspect", [1, p.width/p.height]);
    
      let centresUniform = [];
      let timesUniform = [];
      for(let i = 0; i < NUM_SHOCKWAVES; i ++) {
        if(times[i] < 1) {
          times[i] += 0.005; // vitesse de l'onde
        }
        centresUniform = centresUniform.concat(centres[i]);
        timesUniform.push(Math.pow(times[i], 1/1.5));
      }
        
      shockWaveShader.setUniform("centres", centresUniform);
      shockWaveShader.setUniform("times", timesUniform);
        
      p.clear();
      p.rect(-p.width/2, -p.height/2, p.width, p.height);
    }

  };

  p.mousePressed = () => {
    // Déclenche une nouvelle onde de choc
    centres.shift();
    times.shift();
    // Corriger les coordonnées : inverser Y pour correspondre au shader
    centres.push([p.mouseX / p.width, p.mouseY / p.height]);
    times.push(0);
  };

};