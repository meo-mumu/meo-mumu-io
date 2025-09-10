/**
 * Artwork Manager - Gestion des œuvres shader
 */
window.ArtworkManager = {
  artworks: [],
  activeInstances: new Map(),
  
  async init() {
    console.log('🎨 Initializing Artwork Manager');
    this.loadArtworks();
  },
  
  loadArtworks() {
    // Définition des œuvres disponibles
    this.artworks = [
      {
        id: 'conway',
        name: 'Conway\'s Game of Life',
        description: 'Automate cellulaire simulant l\'évolution de cellules selon des règles simples. Dessinez pour ajouter des cellules, appuyez sur R pour réinitialiser.',
        vertexShader: 'assets/glsl/main-v1.vert',
        fragmentShader: 'assets/glsl/conway.frag',
        type: 'cellular-automata'
      },
      {
        id: 'flower',
        name: 'Geometric Flower',
        description: 'Motif floral géométrique généré par des fonctions mathématiques. Une forme organique créée par des équations polaires.',
        vertexShader: 'assets/glsl/main.vert',
        fragmentShader: 'assets/glsl/flower.frag',
        type: 'generative-art'
      }
    ];
  },
  
  getArtworks() {
    return this.artworks;
  },
  
  getArtwork(id) {
    return this.artworks.find(artwork => artwork.id === id);
  },
  
  async startArtwork(artworkId) {
    const artwork = this.getArtwork(artworkId);
    if (!artwork) return;
    
    console.log(`🎨 Starting artwork: ${artwork.name}`);
    
    // Stop any existing instance
    this.stopArtwork(artworkId);
    
    // Create new p5 instance for this artwork
    const ArtworkClass = window[`${this.capitalizeFirst(artworkId)}Artwork`];
    if (ArtworkClass) {
      const instance = new p5(ArtworkClass.sketch, 'artwork-canvas');
      this.activeInstances.set(artworkId, instance);
    }
  },
  
  stopArtwork(artworkId) {
    const instance = this.activeInstances.get(artworkId);
    if (instance) {
      console.log(`🛑 Stopping artwork: ${artworkId}`);
      instance.remove();
      this.activeInstances.delete(artworkId);
    }
  },
  
  stopAllArtworks() {
    for (const [id, instance] of this.activeInstances) {
      this.stopArtwork(id);
    }
  },
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};