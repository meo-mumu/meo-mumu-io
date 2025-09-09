export const Testfont = (p) => {
  
  let fonts = [];
  let courierFont;
  const fontPaths = [
    'assets/fonts/rune/RUNE.TTF',
    'assets/fonts/rune/Ancient_G_Modern.ttf',
    'assets/fonts/rune/Glagolitsa.ttf',
    'assets/fonts/rune/grace_of_etro.ttf',
    'assets/fonts/rune/Nyctographic.otf',
    'assets/fonts/rune/Highschool_Runes_.ttf',
    'assets/fonts/rune/Highschool_Runes.ttf',
    'assets/fonts/rune/Ninjargon-Regular.otf',
    'assets/fonts/rune/DARUNE.otf'
  ];
  
  const fontNames = [
    'RUNE',
    'Ancient_G_Modern',
    'Glagolitsa',
    'grace_of_etro',
    'Nyctographic',
    'Highschool_Runes_',
    'Highschool_Runes',
    'Ninjargon-Regular',
    'DARUNE'
  ];

  p.preload = () => {
    fonts = fontPaths.map(path => p.loadFont(path));
    courierFont = p.loadFont('assets/fonts/CourierPrime-Regular.ttf');
  };

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight).parent('testfont-container');
    p.background(244, 243, 241); // Même couleur que maintext
    p.fill(80); // Même couleur de texte que maintext
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(25);
  };

  p.draw = () => {
    p.background(244, 243, 241);
    
    let startY = 80;
    let lineHeight = 60;
    
    for (let i = 0; i < fonts.length; i++) {
      let y = startY + i * lineHeight;
      
      // Nom de la police à gauche avec Courier
      p.fill(120);
      p.textFont(courierFont);
      p.textSize(12);
      p.text(fontNames[i] + ':', 50, y - 15);
      
      // "Curriculum vitae" avec la police runique
      p.fill(80);
      p.textFont(fonts[i]);
      p.textSize(25);
      p.text('Curriculum vitae', 50, y);
    }
  };
};