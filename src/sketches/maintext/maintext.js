export const Maintext = (p) => {

  let withShader = true;

  let g;
  let fonts = [];
  let instructionFonts = [];
  let showDebugCircles = false;

  let shockWaveShader;
  const NUM_SHOCKWAVES = 10;
  let centres = new Array(NUM_SHOCKWAVES);
  let times = new Array(NUM_SHOCKWAVES);
  let sizes = new Array(NUM_SHOCKWAVES); // Tailles des ondes

  let mainTexts = [
    { text: "Curriculum vitae", x: 0, y: 0, sensitivities: [], hoverStartTime: 0, isHovered: false, url: null },
    { text: "Soundcloud", x: 0, y: 0, sensitivities: [], hoverStartTime: 0, isHovered: false, url: "https://soundcloud.com/meo-sound" },
    { text: "Shaderland", x: 0, y: 0, sensitivities: [], hoverStartTime: 0, isHovered: false, url: null }
  ];
  
  let instructionSensitivities = [];
  
  // Variables pour la détection de vitesse de souris
  let previousMouseX = 0;
  let previousMouseY = 0;
  let mouseSpeedThreshold = 7; // Seuil de vitesse pour générer des ondes (un peu moins sensible)
  let lastWaveTime = 0;
  let waveDelay = 75; // Délai minimum entre les ondes auto-générées (ms) - compromis

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
      font: p.loadFont('assets/fonts/rune/Ancient_G_Modern.ttf'), 
      size: 35, 
      threshold: 1.0 
    };
    
    // Fonts pour instructions (ordre inversé : Ancient -> Courier)
    instructionFonts[0] = { 
      font: p.loadFont('assets/fonts/CourierPrime-Regular.ttf'), 
      size: 16, 
      threshold: 0.2 
    };
    instructionFonts[1] = { 
      font: p.loadFont('assets/fonts/rune/Highschool_Runes.ttf'), 
      size: 16, 
      threshold: 0.4 
    };
    instructionFonts[2] = { 
      font: p.loadFont('assets/fonts/rune/grace_of_etro.ttf'), 
      size: 16, 
      threshold: 0.6 
    };
    instructionFonts[3] = { 
      font: p.loadFont('assets/fonts/rune/Ancient_G_Modern.ttf'), 
      size: 16, 
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
    
    mainTexts[0].x = centerX;
    mainTexts[0].y = centerY - lineSpacing;
    
    mainTexts[1].x = centerX;
    mainTexts[1].y = centerY;
    
    mainTexts[2].x = centerX;
    mainTexts[2].y = centerY + lineSpacing;
    
    mainTexts.forEach(textObj => {
      textObj.sensitivities = Array.from({length: textObj.text.length}, () => p.random(-0.2, 0.2));
    });
    
    // Générer sensitivités pour le texte d'instruction
    let instructionText = "> You can clic anywhere";
    instructionSensitivities = Array.from({length: instructionText.length}, () => p.random(-0.2, 0.2));

    if (withShader) {
      p.shader(shockWaveShader);
      for(let i = 0; i < NUM_SHOCKWAVES; i ++) {
        centres[i] = [0, 0];
        times[i] = 1;
        sizes[i] = 1.0; // Taille par défaut
      }
    }


  };

  // Fonction smoothstep pour courbes douces (équivalent GLSL)
  const smoothstep = (edge0, edge1, x) => {
    let t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  // Fonction utilitaire pour sélectionner l'index de police basé sur les thresholds
  const getFontIndex = (t, fontArray) => {
    let fontIndex = fontArray.findIndex(fontObj => t < fontObj.threshold);
    if (fontIndex === -1) fontIndex = fontArray.length - 1;
    return fontIndex;
  };

  // Fonction pour détecter si la souris survole un texte
  const isHoveringText = (text, x, y, spacing) => {
    let startX = x - (text.length * spacing) / 2 + spacing / 2;
    let endX = startX + (text.length - 1) * spacing;
    let textHeight = 40; // Zone de survol approximative
    
    return p.mouseX >= startX - spacing/2 && 
           p.mouseX <= endX + spacing/2 && 
           p.mouseY >= y - textHeight/2 && 
           p.mouseY <= y + textHeight/2;
  };

  // Fonction pour rendre un texte avec sensitivité par lettre et soulignement optionnel
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
    
    // Dessiner le soulignement basé sur le progress
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

  // Fonction pour rendre tous les textes sur le graphics buffer
  const renderAllTexts = () => {
    // Rendre chaque texte central avec gestion du hover et animation
    mainTexts.forEach(textObj => {
      let isCurrentlyHovered = isHoveringText(textObj.text, textObj.x, textObj.y, 15);
      
      // Gérer le début du hover
      if (isCurrentlyHovered && !textObj.isHovered) {
        textObj.isHovered = true;
        textObj.hoverStartTime = p.millis();
      }
      // Gérer la fin du hover
      else if (!isCurrentlyHovered && textObj.isHovered) {
        textObj.isHovered = false;
        textObj.hoverStartTime = 0;
      }
      
      // Calculer le progress de l'animation
      let underlineProgress = 0;
      if (textObj.isHovered) {
        let elapsedTime = p.millis() - textObj.hoverStartTime;
        let animationDuration = 200; // 200ms pour l'animation complète
        underlineProgress = Math.min(elapsedTime / animationDuration, 1.0);
      }
      
      renderText(textObj.text, textObj.x, textObj.y, 15, fonts, textObj.sensitivities, 80, underlineProgress);
    });

    // Texte d'instruction en bas à gauche (pas de soulignement)
    let instructionText = "> You can clic anywhere";
    let instructionX = 30 + (instructionText.length * 10) / 2;
    let instructionY = g.height - 40;
    
    renderText(instructionText, instructionX, instructionY, 10, instructionFonts, instructionSensitivities, 100, 0);
  };

  // Fonction pour générer une onde de choc avec taille variable
  const generateShockwave = (x, y, size = 1.0) => {
    centres.shift();
    times.shift();
    sizes.shift();
    centres.push([x / p.width, y / p.height]);
    times.push(0);
    sizes.push(size);
  };

  // Fonction pour détecter et gérer la vitesse de souris
  const handleMouseSpeed = () => {
    let deltaX = p.mouseX - previousMouseX;
    let deltaY = p.mouseY - previousMouseY;
    let mouseSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Si la vitesse dépasse le seuil et qu'assez de temps s'est écoulé
    if (mouseSpeed > mouseSpeedThreshold && p.millis() - lastWaveTime > waveDelay) {
      // Calculer la taille proportionnelle à la vitesse avec courbe smoothstep
      let minSize = 0.0; // Un peu plus visible pour mouvement lent
      let maxSize = 1.2; // Compromis entre avant et maintenant
      let normalizedSpeed = Math.min(mouseSpeed / 35, 1.0); // Normaliser sur 35px
      
      // Système à 4 états comme les thresholds des polices
      // Tu peux modifier ces valeurs pour ajuster les transitions :
      let threshold1 = 0.6; // Seuil vitesse lente → moyen-lente
      let threshold2 = 0.8; // Seuil moyen-lente → moyen-rapide  
      let threshold3 = 0.9; // Seuil moyen-rapide → rapide
      
      let waveSize;
      if (normalizedSpeed < threshold1) {
        // État 1: Très lent - onde minimale
        waveSize = minSize;
      } else if (normalizedSpeed < threshold2) {
        // État 2: Moyen-lent - transition douce
        let t = smoothstep(threshold1, threshold2, normalizedSpeed);
        waveSize = minSize + (maxSize * 0.0003 - minSize) * t;
      } else if (normalizedSpeed < threshold3) {
        // État 3: Moyen-rapide - transition plus marquée
        let t = smoothstep(threshold2, threshold3, normalizedSpeed);
        waveSize = maxSize * 0.1 + (maxSize * 0.5 - maxSize * 0.2) * t;
      } else {
        // État 4: Rapide - taille maximale
        let t = smoothstep(threshold3, 1.0, normalizedSpeed);
        waveSize = maxSize * 0.8 + (maxSize - maxSize * 0.9) * t;
      }
      
      generateShockwave(p.mouseX, p.mouseY, waveSize);
      lastWaveTime = p.millis();
    }
    
    // Mettre à jour la position précédente
    previousMouseX = p.mouseX;
    previousMouseY = p.mouseY;
  };

  // Fonction pour mettre à jour et gérer les shockwaves
  const updateShockwaves = () => {
    let centresUniform = [];
    let timesUniform = [];
    let sizesUniform = [];
    for(let i = 0; i < NUM_SHOCKWAVES; i ++) {
      if(times[i] < 1) {
        times[i] += 0.005; // vitesse de l'onde
      }
      centresUniform = centresUniform.concat(centres[i]);
      timesUniform.push(Math.pow(times[i], 1/1.5));
      sizesUniform.push(sizes[i]);
    }
    
    shockWaveShader.setUniform("centres", centresUniform);
    shockWaveShader.setUniform("times", timesUniform);
    shockWaveShader.setUniform("sizes", sizesUniform);
  };

  // Fonction pour le rendu avec shader
  const renderWithShader = () => {
    console.log("Rendering with shader");
    shockWaveShader.setUniform("image", g);
    shockWaveShader.setUniform("aspect", [1, p.width/p.height]);
    
    updateShockwaves();
    
    p.clear();
    p.rect(-p.width/2, -p.height/2, p.width, p.height);
  };

  // Fonction pour le rendu sans shader
  const renderWithoutShader = () => {
    console.log("Rendering without shader");
    p.image(g, 0, 0);
  };

  p.draw = () => {
    p.translate(-p.width/2, -p.height/2);
    
    // Détecter la vitesse de souris et générer des ondes si nécessaire
    handleMouseSpeed();
    
    // Préparer le graphics buffer
    g.background(244, 243, 241);
    p.clear();

    // Rendre tous les textes
    renderAllTexts();

    // Choisir le mode de rendu
    if (withShader) {
      renderWithShader();
    } else {
      renderWithoutShader();
    }
  };

  p.mousePressed = () => {
    // Vérifier si on clique sur un mainText avec URL
    for (let textObj of mainTexts) {
      let isClicked = isHoveringText(textObj.text, textObj.x, textObj.y, 15);
      if (isClicked && textObj.url) {
        window.open(textObj.url, '_blank');
        return; // Sortir pour éviter l'onde de choc
      }
    }
    
    // Si pas de clic sur texte, déclencher une onde de choc normale
    generateShockwave(p.mouseX, p.mouseY);
  };

};