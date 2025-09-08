export const Maintext = (p) => {
  let fonts = [];
  let showDebugCircles = false;
  let texts = [
    { text: "Curriculum vitae", x: 0, y: 0, size: 25, sensitivities: [] },
    { text: "Soundcloud", x: 0, y: 0, size: 25, sensitivities: [] },
    { text: "Shaderland", x: 0, y: 0, size: 25, sensitivities: [] }
  ];

  p.preload = () => {
    fonts[0] = p.loadFont('assets/fonts/CourierPrime-Regular.ttf');
    fonts[1] = p.loadFont('assets/fonts/Highschool_Runes.ttf');
    fonts[2] = p.loadFont('assets/fonts/Glagolitsa.ttf');
    fonts[3] = p.loadFont('assets/fonts/Ancient_G_Modern.ttf');
  };

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL).parent('maintext-container');
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(80);
    
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
  };

  p.draw = () => {
    p.clear();
    p.translate(-p.width/2, -p.height/2);
    
    const thresholds = [0.8, 0.88, 0.95, 1.0];
    
    // Afficher les rectangles de debug pour les seuils
    if (showDebugCircles) {
      let maxDistX = p.width / 2;
      let maxDistY = p.height / 2;
      
      p.stroke(200, 0, 0, 100);
      p.strokeWeight(1);
      p.noFill();
      p.rectMode(p.CENTER);
      
      texts.forEach(textObj => {
        thresholds.forEach((threshold, index) => {
          let widthRect = threshold * maxDistX * 2;
          let heightRect = threshold * maxDistY * 2;
          p.rect(textObj.x, textObj.y, widthRect, heightRect);
          
          p.fill(200, 0, 0);
          p.textSize(10);
          p.text(`${threshold}`, textObj.x + widthRect/2 + 10, textObj.y - heightRect/2);
          p.noFill();
        });
      });
      
      p.noStroke();
    }

    // Rendre chaque texte
    texts.forEach(textObj => {
      let spacing = 15;
      let startX = textObj.x - (textObj.text.length * spacing) / 2 + spacing / 2;
      
      let d = p.dist(p.mouseX, p.mouseY, textObj.x, textObj.y);
      let maxDist = Math.min(p.width, p.height) / 2;
      
      p.textSize(textObj.size);

      for (let i = 0; i < textObj.text.length; i++) {
        let letterX = startX + i * spacing;
        let letterY = textObj.y;
        let t = p.constrain((d / maxDist) + textObj.sensitivities[i], 0, 1);

        let fontIndex = thresholds.findIndex(th => t < th);
        if (fontIndex === -1) fontIndex = fonts.length - 1;

        p.textFont(fonts[fontIndex]);
        p.text(textObj.text[i], letterX, letterY);
        
        // Afficher l'influence en mode debug
        if (showDebugCircles) {
          p.fill(100, 100, 255); // Bleu
          p.textSize(10);
          p.text(`${fontIndex}`, letterX, letterY + 20); // Index de font sous la lettre
          p.text(`${t.toFixed(2)}`, letterX, letterY + 32); // Valeur t sous l'index
          p.noFill();
          p.textSize(textObj.size); // Remettre la taille originale
        }
      }
    });
  };

};