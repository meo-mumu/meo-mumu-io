/**
 * Layout Manager - Gestion du layout Shaderland
 */
window.LayoutManager = {
  container: null,
  
  init() {
    console.log('🎨 Initializing Layout Manager');
    this.createLayout();
  },
  
  createLayout() {
    // Créer le container principal Shaderland
    this.container = document.createElement('div');
    this.container.id = 'sl-container';
    this.container.className = 'sl-container hidden';
    
    this.container.innerHTML = `
      <!-- Header avec titre -->
      <div class="sl-header">
        <h1 class="sl-title">Shaderland</h1>
        <div class="sl-close" id="sl-close">×</div>
      </div>
      
      <!-- Content principal -->
      <div class="sl-content">
        <!-- Liste des œuvres à gauche -->
        <div class="sl-sidebar">
          <div class="sl-artwork-list-header">
            <h2>Œuvres</h2>
          </div>
          <div id="sl-artwork-list" class="sl-artwork-list"></div>
        </div>
        
        <!-- Zone centrale pour le canvas -->
        <div class="sl-main">
          <div class="sl-artwork-canvas-container">
            <div id="sl-artwork-canvas" class="sl-artwork-canvas"></div>
          </div>
          
          <!-- Description sous le canvas -->
          <div id="sl-artwork-description" class="sl-artwork-description">
            <h3>Sélectionnez une œuvre</h3>
            <p>Choisissez une œuvre dans la liste pour la voir s'animer.</p>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter au body
    document.body.appendChild(this.container);
    
    // Setup close button
    const closeBtn = document.getElementById('sl-close');
    closeBtn.addEventListener('click', () => {
      window.Shaderland.deactivate();
    });
  },
  
  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      setTimeout(() => {
        this.container.classList.add('active');
      }, 10);
    }
  },
  
  hide() {
    if (this.container) {
      this.container.classList.remove('active');
      setTimeout(() => {
        this.container.classList.add('hidden');
      }, 300);
    }
  }
};