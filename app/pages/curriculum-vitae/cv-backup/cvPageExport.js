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

    // Créer un graphics haute résolution pour le PDF (A4 à 300 DPI)
    const pdfWidth = 2480;  // A4 width à 300 DPI (8.27" * 300)
    const pdfHeight = 3508; // A4 height à 300 DPI (11.69" * 300)
    const pdfGraphics = createGraphics(pdfWidth, pdfHeight);

    // Configurer le graphics PDF directement sans toucher au global
    pdfGraphics.background(255, 255, 255);

    // Calculer l'échelle par rapport à l'affichage actuel
    const currentLayout = this.cvPage.calculateLayout();
    const scaleX = (pdfWidth * 0.9) / currentLayout.container.width; // 90% de la largeur PDF
    const scaleY = scaleX; // Garder les proportions

    // Appliquer l'échelle sur le graphics PDF
    pdfGraphics.push();
    pdfGraphics.scale(scaleX, scaleY);

    // Calculer les dimensions mises à l'échelle
    const scaledMargin = 50 / scaleX;
    const scaledContentWidth = (pdfWidth * 0.9) / scaleX;
    const scaledContentX = ((pdfWidth - (pdfWidth * 0.9)) / 2) / scaleX;

    // Temporairement utiliser le graphics PDF pour le rendu
    const originalGraphic = graphic;
    graphic = pdfGraphics;

    // Rendu du contenu
    const sectionSpacing = this.cvPage.theme.dimensions.sectionSpacing;
    const headerSpacing = sectionSpacing * 1.5;
    let currentY = scaledMargin;

    // Use the same render methods for consistency
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
    const imgData = canvas.toDataURL('image/png');

    // Créer le PDF avec jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Ajouter l'image au PDF (210mm x 297mm = A4)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

    // Télécharger le PDF
    pdf.save('CV_Leo_Macias.pdf');

    console.log("Export PDF terminé !");
  }
}