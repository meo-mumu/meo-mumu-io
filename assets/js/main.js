/**
 * Main JavaScript for portfolio functionality
 * Handles navigation, color randomization, and interactions
 */

// Global color palette (from example)
const GLOBAL_COLORS = [
  "#E84420", "#F4CD00", "#3E58E2", "#F1892A", 
  "#22A722", "#7F3CAC", "#F391C7", "#3DC1A2"
];

// Utility functions
const rnd = (arr) => arr[Math.floor(arr.length * Math.random())];

const shuffle = (arr) => {
  let rand, tmp, len = arr.length;
  const ret = arr.slice();
  while (len) {
    rand = Math.floor(Math.random() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initColorizedBullets();
  initNavigation();
  initEmailObfuscation();
  initExpandableItems();
});

/**
 * Apply random colors to bullet points
 */
function initColorizedBullets() {
  // Appliquer couleurs aux bullets principaux ET aux sub-bullets
  const allBullets = document.querySelectorAll('.bullet');
  if (allBullets.length === 0) return;
  
  const colors = shuffle(GLOBAL_COLORS);
  allBullets.forEach((bullet, index) => {
    const color = colors[index % colors.length];
    bullet.style.setProperty('--bullet-color', color);
  });
}

/**
 * Handle navigation interactions
 */
function initNavigation() {
  // Add active state handling
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.opacity = '0.7';
    }
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Handle email obfuscation (from example)
 */
function initEmailObfuscation() {
  const emailElements = document.querySelectorAll('.email');
  emailElements.forEach(email => {
    const txt = email.textContent
      .replace('at', '@')
      .replace('dot', '.')
      .replace(/\s+/g, '');
    email.textContent = txt;
    email.href = `mailto:${txt}`;
  });
}

/**
 * Responsive navigation toggle for mobile
 */
function initMobileNav() {
  const nav = document.querySelector('.nav');
  let isScrolled = false;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    if (scrolled !== isScrolled) {
      isScrolled = scrolled;
      nav.style.background = isScrolled ? 
        'rgba(247, 247, 247, 0.98)' : 
        'rgba(247, 247, 247, 0.95)';
    }
  });
}

// Initialize mobile nav
if (window.innerWidth <= 768) {
  initMobileNav();
}

// Re-initialize on resize
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    initMobileNav();
  }
});

/**
 * Initialize expandable/collapsible items (accordions)
 */
function initExpandableItems() {
  const headers = document.querySelectorAll('.expandable-header');
  
  headers.forEach(header => {
    // Add keyboard accessibility
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
    
    // Click handler
    header.addEventListener('click', () => {
      toggleExpandableItem(header);
    });
    
    // Keyboard handler (Enter and Space)
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleExpandableItem(header);
      }
    });
  });
}

/**
 * Toggle an expandable item
 * @param {HTMLElement} header The header element that was clicked
 */
function toggleExpandableItem(header) {
  const item = header.closest('.expandable-item');
  const isActive = item.classList.contains('active');
  const targetId = header.getAttribute('data-target');
  
  // Close all other expandable items for accordion behavior
  document.querySelectorAll('.expandable-item.active').forEach(activeItem => {
    if (activeItem !== item) {
      activeItem.classList.remove('active');
      const activeHeader = activeItem.querySelector('.expandable-header');
      activeHeader.setAttribute('aria-expanded', 'false');
      
      // Détruire le terrain si on ferme cet accordéon
      const activeTarget = activeHeader.getAttribute('data-target');
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
      initColorizedBullets();
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

/**
 * Animation progressive des sections du CV
 */
function animateCVSections() {
  const elementsWithDelay = document.querySelectorAll('#cv-content [data-delay]');
  
  // Reset all animations
  elementsWithDelay.forEach(el => {
    el.classList.remove('animate-in');
  });
  
  // Trigger animations with progressive delays
  elementsWithDelay.forEach(element => {
    const delay = parseInt(element.getAttribute('data-delay')) || 0;
    
    setTimeout(() => {
      element.classList.add('animate-in');
    }, delay * 100); // 100ms between each animation
  });
}

// Export for potential use in other modules
window.PortfolioUtils = {
  rnd,
  shuffle,
  GLOBAL_COLORS,
  initColorizedBullets,
  toggleExpandableItem,
  animateCVSections
};