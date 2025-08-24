// Component pour la navigation mobile responsive avec effets de scroll
let isInitialized = false;

export function initMobileNav() {
  // Éviter les initialisations multiples
  if (isInitialized) return;
  
  // Uniquement sur mobile/tablette
  if (window.innerWidth <= 768) {
    setupScrollEffects();
    isInitialized = true;
  }
}

function setupScrollEffects() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  
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

// Fonction pour réinitialiser lors du redimensionnement
export function handleResize() {
  if (window.innerWidth <= 768 && !isInitialized) {
    initMobileNav();
  } else if (window.innerWidth > 768) {
    // Reset sur desktop
    isInitialized = false;
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.style.background = '';
    }
  }
}