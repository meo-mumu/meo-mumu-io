// Gestion du canvas et redimensionnement
export function resizeCanvasToContainer(p) {
  const containerElement = document.getElementById('particles-container');
  if (!containerElement) return;
  const { offsetWidth: w, offsetHeight: h } = containerElement;
  p.resizeCanvas(w, h);
  console.log('🔄 Canvas redimensionné:', w, h);
}

export function checkCanvasSize(p) {
  const containerElement = document.getElementById('particles-container');
  if (!containerElement) return;
  const { offsetWidth: w, offsetHeight: h } = containerElement;
  if (p.width !== w || p.height !== h) {
    p.resizeCanvas(w, h);
    console.log('🔄 Auto-resize canvas:', w, h);
  }
}