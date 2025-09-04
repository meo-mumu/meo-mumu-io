// Point d'entrée JS pour le front - architecture clean code
import { Particles } from '../../../src/sketches/particles/particles.js';
import { Lenia } from '../../../src/sketches/lenia/lenia.js';
import { initExpandable, toggleExpandableItem } from '../../../src/ui/expandable.js';
import { initBulletColorizer } from '../../../src/ui/bullet-colorizer.js';
import { initNavigation } from '../../../src/ui/navigation.js';
import { initEmailObfuscation } from '../../../src/ui/email.js';
import { initMobileNav, handleResize } from '../../../src/ui/mobile-nav.js';
import { animateCVSections } from '../../../src/ui/animation-cv.js';
import { GLOBAL_COLORS, rnd, shuffle } from '../../../src/ui/bullet-colorizer.js';

// Initialisation complète au chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
  // Initialisation des sketchs p5.js
  new window.p5(Particles, 'particles-container');
  new window.p5(Lenia, 'lenia-container');
  
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
