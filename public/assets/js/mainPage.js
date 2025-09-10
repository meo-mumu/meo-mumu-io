/**
 * Main interactive text system - Simplified version without ES6 modules
 */

const MainPage = (p) => {
  // Core p5.js variables
  let g;
  let withShader = true;

  // Shader variables
  let shockWaveShader;
  const NUM_SHOCKWAVES = 10;
  let centres = new Array(NUM_SHOCKWAVES);
  let times = new Array(NUM_SHOCKWAVES);
  let sizes = new Array(NUM_SHOCKWAVES);

  // Font arrays
  let Mainfonts = [];
  let instructionFonts = [];

  // Text objects
  let mainTexts = [
    { text: "Curriculum vitae", x: 0, y: 0, sensitivities: [], hoverStartTime: 0, isHovered: false, action: "cv" },
    { text: "Soundcloud", x: 0, y: 0, sensitivities: [], hoverStartTime: 0, isHovered: false, url: "https://soundcloud.com/meo-sound" },
    { text: "Shaderland", x: 0, y: 0, sensitivities: [], hoverStartTime: 0, isHovered: false, url: null }
  ];

  let instructionSensitivities = [];

  // Mouse tracking variables
  let previousMouseX = 0;
  let previousMouseY = 0;
  let mouseSpeedThreshold = 7;
  let lastWaveTime = 0;
  let waveDelay = 75;

  p.preload = () => {
    // Load main fonts
    Mainfonts[0] = { 
      font: p.loadFont('assets/fonts/CourierPrime-Regular.ttf'), 
      size: 25, 
      threshold: 0.8 
    };
    Mainfonts[1] = { 
      font: p.loadFont('assets/fonts/rune/Highschool_Runes.ttf'), 
      size: 35, 
      threshold: 0.88 
    };
    Mainfonts[2] = { 
      font: p.loadFont('assets/fonts/rune/grace_of_etro.ttf'), 
      size: 35, 
      threshold: 0.95 
    };
    Mainfonts[3] = { 
      font: p.loadFont('assets/fonts/rune/Ancient_G_Modern.ttf'), 
      size: 35, 
      threshold: 1.0 
    };
    
    // Load instruction fonts
    instructionFonts[0] = { 
      font: p.loadFont('assets/fonts/CourierPrime-Regular.ttf'), 
      size: 12, 
      threshold: 0.6
    };
    instructionFonts[1] = { 
      font: p.loadFont('assets/fonts/rune/Highschool_Runes.ttf'), 
      size: 12, 
      threshold: 0.75 
    };
    instructionFonts[2] = { 
      font: p.loadFont('assets/fonts/rune/grace_of_etro.ttf'), 
      size: 12, 
      threshold: 0.9 
    };
    instructionFonts[3] = { 
      font: p.loadFont('assets/fonts/rune/Ancient_G_Modern.ttf'), 
      size: 12, 
      threshold: 1.0 
    };
    
    shockWaveShader = p.loadShader('assets/glsl/main.vert', 'assets/glsl/shock.frag');
  };

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL).parent('maintext-container');
    
    g = p.createGraphics(p.width, p.height);
    g.textAlign(p.CENTER, p.CENTER);
    g.fill(80);
    g.background(244, 200, 200);
    
    // Initialize Shaderland
    window.Shaderland.init();
    
    // Setup text positions
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const lineSpacing = 80;
    
    mainTexts[0].x = centerX;
    mainTexts[0].y = centerY - lineSpacing;
    mainTexts[1].x = centerX;
    mainTexts[1].y = centerY;
    mainTexts[2].x = centerX;
    mainTexts[2].y = centerY + lineSpacing;
    
    // Generate sensitivities
    mainTexts.forEach(textObj => {
      textObj.sensitivities = Array.from({length: textObj.text.length}, () => p.random(-0.2, 0.2));
    });
    
    const instructionText = "> Clic to copy my email adress";
    instructionSensitivities = Array.from({length: instructionText.length}, () => p.random(-0.2, 0.2));

    // Setup shader
    if (withShader) {
      p.shader(shockWaveShader);
      for(let i = 0; i < NUM_SHOCKWAVES; i++) {
        centres[i] = [0, 0];
        times[i] = 1;
        sizes[i] = 1.0;
      }
    }

    // Initialize CV manager after DOM is ready
    setTimeout(() => {
      window.CVManager.init();
    }, 100);
  };

  // Utility functions
  const smoothstep = (edge0, edge1, x) => {
    let t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  const getFontIndex = (t, fontArray) => {
    let fontIndex = fontArray.findIndex(fontObj => t < fontObj.threshold);
    if (fontIndex === -1) fontIndex = fontArray.length - 1;
    return fontIndex;
  };

  const isHoveringText = (text, x, y, spacing) => {
    let startX = x - (text.length * spacing) / 2 + spacing / 2;
    let endX = startX + (text.length - 1) * spacing;
    let textHeight = 40;
    
    return p.mouseX >= startX - spacing/2 && 
           p.mouseX <= endX + spacing/2 && 
           p.mouseY >= y - textHeight/2 && 
           p.mouseY <= y + textHeight/2;
  };

  const renderText = (text, x, y, spacing, fontArray, sensitivities, color = 80, underlineProgress = 0) => {
    let startX = x - (text.length * spacing) / 2 + spacing / 2;
    let maxDist = Math.min(g.width, g.height) / 2;

    for (let i = 0; i < text.length; i++) {
      let letterX = startX + i * spacing;
      let letterY = y;
      let d = g.dist(p.mouseX, p.mouseY, letterX, letterY);
      let t = g.constrain((d / maxDist) + sensitivities[i], 0, 1);

      let fontIndex = getFontIndex(t, fontArray);

      g.textFont(fontArray[fontIndex].font);
      g.textSize(fontArray[fontIndex].size);
      g.fill(color);
      g.text(text[i], letterX, letterY);
    }
    
    // Draw underline
    if (underlineProgress > 0) {
      let startXLine = startX - spacing/2;
      let endXLine = startX + (text.length - 1) * spacing + spacing/2;
      let lineWidth = endXLine - startXLine;
      let currentEndX = startXLine + (lineWidth * underlineProgress);
      
      g.stroke(color);
      g.strokeWeight(1);
      g.line(startXLine, y + 20, currentEndX, y + 20);
      g.noStroke();
    }
  };

  const generateShockwave = (x, y, size = 1.0) => {
    centres.shift();
    times.shift();
    sizes.shift();
    centres.push([x / p.width, y / p.height]);
    times.push(0);
    sizes.push(size);
  };

  const triggerBigShockwaveAnimation = () => {
    const shockwavePoints = [
      { x: p.width * 0.2, y: p.height * 0.3, size: 2.0 },
      { x: p.width * 0.8, y: p.height * 0.2, size: 1.8 },
      { x: p.width * 0.1, y: p.height * 0.7, size: 2.2 },
      { x: p.width * 0.9, y: p.height * 0.8, size: 1.9 },
      { x: p.width * 0.5, y: p.height * 0.1, size: 2.1 },
      { x: p.width * 0.4, y: p.height * 0.9, size: 2.0 },
    ];
    
    shockwavePoints.forEach((point, index) => {
      setTimeout(() => {
        generateShockwave(point.x, point.y, point.size);
      }, index * 100);
    });
  };

  const handleMouseSpeed = () => {
    let deltaX = p.mouseX - previousMouseX;
    let deltaY = p.mouseY - previousMouseY;
    let mouseSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (mouseSpeed > mouseSpeedThreshold && p.millis() - lastWaveTime > waveDelay) {
      let minSize = 0.0;
      let maxSize = 1.2;
      let normalizedSpeed = Math.min(mouseSpeed / 35, 1.0);
      
      let threshold1 = 0.6;
      let threshold2 = 0.8;
      let threshold3 = 0.9;
      
      let waveSize;
      if (normalizedSpeed < threshold1) {
        waveSize = minSize;
      } else if (normalizedSpeed < threshold2) {
        let t = smoothstep(threshold1, threshold2, normalizedSpeed);
        waveSize = minSize + (maxSize * 0.0003 - minSize) * t;
      } else if (normalizedSpeed < threshold3) {
        let t = smoothstep(threshold2, threshold3, normalizedSpeed);
        waveSize = maxSize * 0.1 + (maxSize * 0.5 - maxSize * 0.2) * t;
      } else {
        let t = smoothstep(threshold3, 1.0, normalizedSpeed);
        waveSize = maxSize * 0.8 + (maxSize - maxSize * 0.9) * t;
      }
      
      generateShockwave(p.mouseX, p.mouseY, waveSize);
      lastWaveTime = p.millis();
    }
    
    previousMouseX = p.mouseX;
    previousMouseY = p.mouseY;
  };

  p.draw = () => {
    p.translate(-p.width/2, -p.height/2);
    
    handleMouseSpeed();
    
    g.background(244, 243, 241);
    p.clear();

    // Render main texts
    mainTexts.forEach(textObj => {
      let isCurrentlyHovered = isHoveringText(textObj.text, textObj.x, textObj.y, 15);
      
      if (isCurrentlyHovered && !textObj.isHovered) {
        textObj.isHovered = true;
        textObj.hoverStartTime = p.millis();
      } else if (!isCurrentlyHovered && textObj.isHovered) {
        textObj.isHovered = false;
        textObj.hoverStartTime = 0;
      }
      
      let underlineProgress = 0;
      if (textObj.isHovered) {
        let elapsedTime = p.millis() - textObj.hoverStartTime;
        let animationDuration = 200;
        underlineProgress = Math.min(elapsedTime / animationDuration, 1.0);
      }
      
      renderText(textObj.text, textObj.x, textObj.y, 15, Mainfonts, textObj.sensitivities, 80, underlineProgress);
    });

    // Render instruction text
    let instructionText = "> Clic to copy my email adress";
    let instructionX = 30 + (instructionText.length * 10) / 2;
    let instructionY = g.height - 40;
    renderText(instructionText, instructionX, instructionY, 10, instructionFonts, instructionSensitivities, 100, 0);

    
    // Render with shader
    if (withShader) {
      let centresUniform = [];
      let timesUniform = [];
      let sizesUniform = [];
      
      for(let i = 0; i < NUM_SHOCKWAVES; i++) {
        if(times[i] < 1) {
          times[i] += 0.005;
        }
        centresUniform = centresUniform.concat(centres[i]);
        timesUniform.push(Math.pow(times[i], 1/1.5));
        sizesUniform.push(sizes[i]);
      }
      
      shockWaveShader.setUniform("centres", centresUniform);
      shockWaveShader.setUniform("times", timesUniform);
      shockWaveShader.setUniform("sizes", sizesUniform);
      shockWaveShader.setUniform("image", g);
      shockWaveShader.setUniform("aspect", [1, p.width/p.height]);
      
      p.clear();
      p.rect(-p.width/2, -p.height/2, p.width, p.height);
    } else {
      p.image(g, 0, 0);
    }
  };

  p.mousePressed = () => {
    // Check if clicking on main texts
    for (let textObj of mainTexts) {
      let isClicked = isHoveringText(textObj.text, textObj.x, textObj.y, 15);
      if (isClicked) {
        if (textObj.action === "cv") {
          triggerBigShockwaveAnimation();
          setTimeout(() => {
            window.CVManager.open();
          }, 1000);
        } else if (textObj.text === "Shaderland") {
          triggerBigShockwaveAnimation();
          setTimeout(() => {
            window.Shaderland.activate();
          }, 1000);
        } else if (textObj.url) {
          window.open(textObj.url, '_blank');
        }
        return;
      }
    }
    
    generateShockwave(p.mouseX, p.mouseY);
  };
};

// Make it globally available
window.MainPage = MainPage;