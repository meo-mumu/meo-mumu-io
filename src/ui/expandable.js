// Accordéons et navigation - version améliorée
import { animateCVSections } from './animation-cv.js';
import { recolorBullets } from './bullet-colorizer.js';

export function initExpandable() {
  // Initialisation des accordéons (expandable items)
  const headers = document.querySelectorAll('.expandable-header');
  headers.forEach(header => {
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
    header.addEventListener('click', () => {
      toggleExpandableItem(header);
    });
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleExpandableItem(header);
      }
    });
  });
}

export function toggleExpandableItem(header) {
  const item = header.closest('.expandable-item');
  const isActive = item.classList.contains('active');
  const targetId = header.getAttribute('data-target');
  
  // Close all other expandable items for accordion behavior
  document.querySelectorAll('.expandable-item.active').forEach(activeItem => {
    if (activeItem !== item) {
      activeItem.classList.remove('active');
      const activeHeader = activeItem.querySelector('.expandable-header');
      activeHeader.setAttribute('aria-expanded', 'false');
      const activeTarget = activeHeader.getAttribute('data-target');
      
      // Détruire le terrain si on ferme cet accordéon
      if (activeTarget === 'coding-content' && window.TerrainSystem) {
        window.TerrainSystem.destroy();
        window.TerrainSystem.isActive = false;
      }
      
    }
  });
  
  // Toggle current item
  if (isActive) {
    item.classList.remove('active');
    header.setAttribute('aria-expanded', 'false');
    
    // Détruire le terrain si on ferme
    if (targetId === 'coding-content' && window.TerrainSystem) {
      window.TerrainSystem.destroy();
      window.TerrainSystem.isActive = false;
    }
    
  } else {
    item.classList.add('active');
    header.setAttribute('aria-expanded', 'true');
    
    // Activer le terrain si c'est l'accordéon coding
    if (targetId === 'coding-content' && window.TerrainSystem) {
      setTimeout(() => {
        window.TerrainSystem.setup();
        window.TerrainSystem.isActive = true;
      }, 100);
    }
    
    
    // Animation progressive pour le CV
    if (targetId === 'cv-content') {
      setTimeout(() => {
        animateCVSections();
      }, 200);
    }
    
    // Réappliquer les couleurs aux nouveaux bullets visibles
    setTimeout(() => {
      recolorBullets();
    }, 50);
    
    // Smooth scroll to make sure expanded content is visible
    setTimeout(() => {
      item.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 200);
  }
}
