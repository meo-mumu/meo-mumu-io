/**
 * Shaderland - Main Controller
 * Single Page Application pour la gestion des œuvres shader
 */
window.Shaderland = {
  isActive: false,
  currentArtwork: null,
  
  // Managers
  artworkManager: null,
  uiManager: null,
  layoutManager: null,
  
  async init() {
    console.log('🎨 Initializing Shaderland');
    
    // Initialize managers in correct order
    this.artworkManager = window.ArtworkManager;
    this.uiManager = window.UIManager;
    this.layoutManager = window.LayoutManager;
    
    // Layout first (creates DOM elements)
    this.layoutManager.init();
    
    // Then artwork manager
    await this.artworkManager.init();
    
    // Then UI manager (needs DOM elements to exist)
    this.uiManager.init();
    
    this.setupEventListeners();
  },
  
  activate() {
    console.log('🎨 Activating Shaderland');
    this.isActive = true;
    
    // Hide mainPage
    window.MainPageManager?.deactivate();
    
    // Show Shaderland UI
    this.layoutManager.show();
    
    // Wait a bit for DOM to be ready, then show artwork list
    setTimeout(() => {
      this.uiManager.showArtworkList();
      
      // Load first artwork by default
      const artworks = this.artworkManager.getArtworks();
      console.log('📋 Available artworks:', artworks);
      if (artworks.length > 0) {
        this.selectArtwork(artworks[0].id);
      }
    }, 100);
  },
  
  deactivate() {
    console.log('🎨 Deactivating Shaderland');
    this.isActive = false;
    
    // Stop current artwork
    if (this.currentArtwork) {
      this.artworkManager.stopArtwork(this.currentArtwork);
    }
    
    // Hide UI
    this.layoutManager.hide();
    
    // Show mainPage
    window.MainPageManager?.activate();
  },
  
  selectArtwork(artworkId) {
    console.log(`🎨 Selecting artwork: ${artworkId}`);
    
    // Stop current artwork
    if (this.currentArtwork) {
      this.artworkManager.stopArtwork(this.currentArtwork);
    }
    
    // Start new artwork
    const artwork = this.artworkManager.getArtwork(artworkId);
    if (artwork) {
      this.currentArtwork = artworkId;
      this.artworkManager.startArtwork(artworkId);
      this.uiManager.updateDescription(artwork);
      this.uiManager.updateActiveArtwork(artworkId);
    }
  },
  
  setupEventListeners() {
    // Escape key to exit Shaderland
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.deactivate();
      }
    });
  }
};