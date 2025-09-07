// Loader pour le mini CV
export class MiniCVLoader {
  static async loadMiniCV(containerId) {
    try {
      const response = await fetch('/components/mini-cv.html');
      const html = await response.text();
      
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du chargement du mini CV:', error);
      return false;
    }
  }
}