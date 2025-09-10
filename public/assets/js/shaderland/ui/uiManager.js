/**
 * UI Manager - Gestion de l'interface Shaderland
 */
window.UIManager = {
  elements: {},
  
  init() {
    console.log('🎨 Initializing UI Manager');
    this.createElements();
  },
  
  createElements() {
    // Récupérer les éléments existants
    this.elements.artworkList = document.getElementById('sl-artwork-list');
    this.elements.artworkCanvas = document.getElementById('sl-artwork-canvas');
    this.elements.artworkDescription = document.getElementById('sl-artwork-description');
  },
  
  showArtworkList() {
    console.log('🎨 Showing artwork list');
    
    if (!this.elements.artworkList) {
      console.error('❌ Artwork list element not found');
      return;
    }
    
    const artworks = window.ArtworkManager.getArtworks();
    console.log('📋 Artworks to display:', artworks);
    
    this.elements.artworkList.innerHTML = '';
    
    if (artworks.length === 0) {
      this.elements.artworkList.innerHTML = '<p>Aucune œuvre disponible</p>';
      return;
    }
    
    artworks.forEach(artwork => {
      console.log(`🎨 Creating item for: ${artwork.name}`);
      const item = document.createElement('div');
      item.className = 'sl-artwork-item';
      item.dataset.artworkId = artwork.id;
      item.innerHTML = `
        <div class="sl-artwork-name">${artwork.name}</div>
        <div class="sl-artwork-type">${artwork.type}</div>
      `;
      
      item.addEventListener('click', () => {
        console.log(`🎨 Clicked on: ${artwork.name}`);
        window.Shaderland.selectArtwork(artwork.id);
      });
      
      this.elements.artworkList.appendChild(item);
    });
    
    console.log(`✅ Added ${artworks.length} artwork items`);
  },
  
  updateDescription(artwork) {
    if (!this.elements.artworkDescription || !artwork) return;
    
    this.elements.artworkDescription.innerHTML = `
      <h3>${artwork.name}</h3>
      <p>${artwork.description}</p>
    `;
  },
  
  updateActiveArtwork(artworkId) {
    // Remove previous active state
    const previousActive = document.querySelector('.sl-artwork-item.active');
    if (previousActive) {
      previousActive.classList.remove('active');
    }
    
    // Add active state to selected artwork
    const activeItem = document.querySelector(`[data-artwork-id="${artworkId}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
};