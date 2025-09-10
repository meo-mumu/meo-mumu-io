/**
 * CV management - Browser compatible version
 */

window.CVManager = {
  isOpen: false,
  cvContainer: null,
  contentContainer: null,

  init() {
    this.cvContainer = document.getElementById('cv-container');
    this.contentContainer = document.getElementById('cv-content-container');
    this.setupEventListeners();
  },

  setupEventListeners() {
    if (this.cvContainer) {
      this.cvContainer.addEventListener('click', (e) => {
        if (e.target === this.cvContainer) {
          this.close();
        }
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.cvContainer && this.cvContainer.classList.contains('active')) {
        this.close();
      }
    });
  },

  async loadCVContent() {
    try {
      const response = await fetch('cv.html');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error loading CV content:', error);
      return '<p>Erreur lors du chargement du CV</p>';
    }
  },

  async open() {
    if (!this.cvContainer || !this.contentContainer) {
      console.error('CV containers not found');
      return;
    }

    // Charger le contenu depuis le fichier cv.html
    const html = await this.loadCVContent();
    this.contentContainer.innerHTML = html;
    
    setTimeout(() => {
      this.triggerAnimations();
    }, 500);
    
    this.cvContainer.style.display = 'flex';
    setTimeout(() => {
      this.cvContainer.classList.add('active');
    }, 10);
    
    this.isOpen = true;
  },

  close() {
    if (!this.cvContainer) return;

    this.cvContainer.classList.remove('active');
    setTimeout(() => {
      this.cvContainer.style.display = 'none';
    }, 300);
    
    this.isOpen = false;
  },

  triggerAnimations() {
    if (!this.contentContainer) return;

    const elementsWithDelay = this.contentContainer.querySelectorAll('[data-delay]');
    elementsWithDelay.forEach(element => {
      const delay = parseInt(element.getAttribute('data-delay')) || 0;
      setTimeout(() => {
        element.classList.add('animate-in');
      }, delay * 100);
    });
  }
};