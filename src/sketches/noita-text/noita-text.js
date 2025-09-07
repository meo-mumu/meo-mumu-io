export const NoitaText = (p) => {
  let fonts = [];
  let texts = [
    { text: "Curriculum vitae", x: 0, y: 0, size: 32, sensitivities: [] },
    { text: "Soundcloud", x: 0, y: 0, size: 32, sensitivities: [] },
    { text: "Shaderland", x: 0, y: 0, size: 32, sensitivities: [] }
  ];

  p.preload = () => {
    fonts[0] = p.loadFont('assets/fonts/CourierPrime-Regular.ttf');
    fonts[1] = p.loadFont('assets/fonts/Glagolitsa.ttf');
    fonts[2] = p.loadFont('assets/fonts/Ancient_G_Modern.ttf');
    fonts[3] = p.loadFont('assets/fonts/Highschool_Runes.ttf');
  };

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight).parent('noita-container');
    p.textAlign(p.CENTER, p.CENTER);
    
    // Positionner les textes verticalement au centre
    let centerX = p.width / 2;
    let centerY = p.height / 2;
    let lineSpacing = 100;
    
    texts[0].x = centerX;
    texts[0].y = centerY - lineSpacing;
    
    texts[1].x = centerX;
    texts[1].y = centerY;
    
    texts[2].x = centerX;
    texts[2].y = centerY + lineSpacing;
    
    // Générer les sensitivités pour chaque texte
    texts.forEach(textObj => {
      textObj.sensitivities = Array.from({length: textObj.text.length}, () => p.random(-0.2, 0.2));
    });
  };

  p.draw = () => {
    p.background(255, 255, 255, 255);
    
    const thresholds = [0.7, 0.8, 0.9, 1.0];

    // Rendre chaque texte
    texts.forEach(textObj => {
      let spacing = 25; // Espacement réduit entre lettres
      let startX = textObj.x - (textObj.text.length * spacing) / 2 + spacing / 2;
      
      let d = p.dist(p.mouseX, p.mouseY, textObj.x, textObj.y);
      let maxDist = Math.min(p.width, p.height) / 2;
      
      p.textSize(textObj.size);

      for (let i = 0; i < textObj.text.length; i++) {
        let letterX = startX + i * spacing;
        let letterY = textObj.y;
        let t = p.constrain((d / maxDist) + textObj.sensitivities[i], 0, 1);

        // Trouve l'index de police selon le seuil
        let fontIndex = thresholds.findIndex(th => t < th);
        if (fontIndex === -1) fontIndex = fonts.length - 1;

        p.textFont(fonts[fontIndex]);
        p.text(textObj.text[i], letterX, letterY);
      }
    });
  };

}