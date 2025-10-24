/**
 * Fonctionnalité d'export PDF pour CvPageP5
 */
class CvPageExport {
  constructor(cvPage) {
    this.cvPage = cvPage;
  }

  exportToPDF() {
    console.log("Export PDF démarré...");

    // Vérifier si jsPDF est disponible
    if (typeof window.jspdf === 'undefined') {
      console.error("jsPDF n'est pas chargé!");
      alert("Erreur: jsPDF n'est pas disponible. Vérifiez que la librairie est bien chargée.");
      return;
    }

    // Activer le mode PDF export pour augmenter les tailles
    this.cvPage.isPdfExport = true;

    // Créer un graphics haute résolution pour le PDF (A4 à 150 DPI)
    const pdfWidth = 1240;  // A4 width à 150 DPI (8.27" * 150)
    const pdfHeight = 1754; // A4 height à 150 DPI (11.69" * 150)
    const pdfGraphics = createGraphics(pdfWidth, pdfHeight);

    // Configurer le graphics PDF directement sans toucher au global
    pdfGraphics.background(255, 255, 255);

    // ÉTAPE 1: Mesurer la hauteur réelle du contenu à l'échelle 1
    const currentLayout = this.cvPage.calculateLayout();
    const originalGraphic = graphic;
    graphic = pdfGraphics;

    const sectionSpacing = this.cvPage.getScaledSpacing(this.cvPage.theme.dimensions.sectionSpacing);
    const headerSpacing = this.cvPage.getScaledSpacing(this.cvPage.theme.dimensions.sectionSpacing * 1.5);
    const margin = this.cvPage.getScaledSpacing(50);
    let measureY = margin;

    measureY = this.cvPage.renderer.renderHeader(0, measureY, currentLayout.container.width);
    measureY += headerSpacing;
    measureY = this.cvPage.renderer.renderExperiences(0, measureY, currentLayout.container.width);
    measureY += sectionSpacing;
    measureY = this.cvPage.renderer.renderSkills(0, measureY, currentLayout.container.width);
    measureY += sectionSpacing;
    measureY = this.cvPage.renderer.renderEducation(0, measureY, currentLayout.container.width);
    measureY += sectionSpacing;
    measureY = this.cvPage.renderer.renderInterests(0, measureY, currentLayout.container.width);
    measureY += margin; // Marge en bas

    const contentHeight = measureY;

    // ÉTAPE 2: Calculer le scale optimal
    const scaleBasedOnWidth = (pdfWidth * 0.95) / currentLayout.container.width;
    const scaleBasedOnHeight = (pdfHeight * 0.95) / contentHeight;
    const optimalScale = Math.min(scaleBasedOnWidth, scaleBasedOnHeight);

    console.log(`Content dimensions: ${currentLayout.container.width} x ${contentHeight}`);
    console.log(`Scale based on width: ${scaleBasedOnWidth.toFixed(2)}`);
    console.log(`Scale based on height: ${scaleBasedOnHeight.toFixed(2)}`);
    console.log(`Optimal scale chosen: ${optimalScale.toFixed(2)}`);

    // ÉTAPE 3: Nettoyer et re-render avec le scale optimal
    pdfGraphics.clear();
    pdfGraphics.background(255, 255, 255);
    pdfGraphics.push();
    pdfGraphics.scale(optimalScale, optimalScale);

    // Calculer les dimensions mises à l'échelle avec marges réduites
    const scaledMargin = margin / optimalScale;
    const availableWidth = pdfWidth / optimalScale;
    const horizontalMarginPercent = 0.03; // 3% de marge de chaque côté (au lieu de centrer)
    const scaledContentWidth = availableWidth * (1 - horizontalMarginPercent * 2);
    const scaledContentX = availableWidth * horizontalMarginPercent;

    // Centrage vertical si le contenu ne remplit pas toute la hauteur
    const scaledContentHeight = contentHeight;
    const availableHeight = pdfHeight / optimalScale;
    const verticalOffset = (availableHeight - scaledContentHeight) / 2;

    let currentY = scaledMargin + verticalOffset;

    // Rendu final du contenu
    currentY = this.cvPage.renderer.renderHeader(scaledContentX, currentY, scaledContentWidth);
    currentY += headerSpacing;
    currentY = this.cvPage.renderer.renderExperiences(scaledContentX, currentY, scaledContentWidth);
    currentY += sectionSpacing;
    currentY = this.cvPage.renderer.renderSkills(scaledContentX, currentY, scaledContentWidth);
    currentY += sectionSpacing;
    currentY = this.cvPage.renderer.renderEducation(scaledContentX, currentY, scaledContentWidth);
    currentY += sectionSpacing;
    currentY = this.cvPage.renderer.renderInterests(scaledContentX, currentY, scaledContentWidth);

    // Restaurer le graphics original IMMÉDIATEMENT
    graphic = originalGraphic;
    pdfGraphics.pop();

    // Convertir en image et créer le PDF
    const canvas = pdfGraphics.canvas;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Créer le PDF avec jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Ajouter l'image au PDF (210mm x 297mm = A4)
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    // Télécharger le PDF
    pdf.save('CV_Leo_Macias.pdf');

    // Désactiver le mode PDF export
    this.cvPage.isPdfExport = false;

    console.log("Export PDF terminé !");
  }
}