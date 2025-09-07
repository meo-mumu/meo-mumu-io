// Point d'entrée JS pour le front - architecture clean code
import { Particles } from '../../../src/sketches/particles/particles.js';
import { Conway } from '../../../src/sketches/conway/conway.js';
import { NoitaText } from '../../../src/sketches/noita-text/noita-text.js';
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
  //new window.p5(Conway, 'conway-container');
  new window.p5(NoitaText, 'noita-container');

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
