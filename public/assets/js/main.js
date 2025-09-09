// Point d'entrée JS pour le front - architecture clean code
import { Particles } from '../../../src/sketches/particles/particles.js';
import { Mainshader } from '../../../src/sketches/mainshader/mainshader.js';
import { Maintext } from '../../../src/sketches/maintext/maintext.js';
import { Testfont } from '../../../src/sketches/testfont/testfont.js';


import { initExpandable, toggleExpandableItem } from '../../../src/ui/expandable.js';
import { initBulletColorizer } from '../../../src/ui/bullet-colorizer.js';
import { initNavigation } from '../../../src/ui/navigation.js';
import { initEmailObfuscation } from '../../../src/ui/email.js';
import { initMobileNav, handleResize } from '../../../src/ui/mobile-nav.js';
import { animateCVSections } from '../../../src/ui/animation-cv.js';
import { GLOBAL_COLORS, rnd, shuffle } from '../../../src/ui/bullet-colorizer.js';
import { MiniCVLoader } from '../../../src/components/mini-cv-loader.js';

// Initialisation complète au chargement du DOM
window.addEventListener('DOMContentLoaded', async () => {
  // Chargement du mini CV
  //await MiniCVLoader.loadMiniCV('mini-cv-container');
  
  // Initialisation des sketchs p5.js
  //new window.p5(Particles, 'particles-container');
  //new window.p5(Mainshader, 'mainshader-container');
  new window.p5(Maintext, 'maintext-container');
  //new window.p5(Testfont, 'testfont-container');

  // Initialisation des composants UI
  initExpandable();
  initBulletColorizer();
  initNavigation();
  initEmailObfuscation();
  initMobileNav();
  
  console.log('✅ Portfolio initialisé avec architecture modulaire');
});

// Gestion du redimensionnement pour la navigation mobile
window.addEventListener('resize', handleResize);

// Export des utilitaires globaux pour compatibilité
window.PortfolioUtils = {
  rnd,
  shuffle,
  GLOBAL_COLORS,
  toggleExpandableItem,
  animateCVSections
};
