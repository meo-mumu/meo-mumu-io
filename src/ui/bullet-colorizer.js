// Component pour la colorisation des bullets avec couleurs aléatoires

// Palette de couleurs globale
const GLOBAL_COLORS = [
  "#E84420", "#F4CD00", "#3E58E2", "#F1892A",
  "#22A722", "#7F3CAC", "#F391C7", "#3DC1A2"
];

// Fonction utilitaire pour mélanger un tableau
function shuffle(arr) {
  let rand, tmp, len = arr.length;
  const ret = arr.slice();
  while (len) {
    rand = Math.floor(Math.random() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
}

// Fonction utilitaire pour sélectionner un élément aléatoire
function rnd(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

export function initBulletColorizer() {
  applyRandomColors();
}

export function applyRandomColors() {
  // Appliquer couleurs aux bullets principaux ET aux sub-bullets
  const allBullets = document.querySelectorAll('.bullet');
  if (allBullets.length === 0) return;

  const colors = shuffle(GLOBAL_COLORS);
  allBullets.forEach((bullet, index) => {
    const color = colors[index % colors.length];
    bullet.style.setProperty('--bullet-color', color);
  });
}

// Fonction pour ré-appliquer les couleurs (utile après ajout de contenu dynamique)
export function recolorBullets() {
  applyRandomColors();
}

// Export des utilitaires pour compatibilité
export { GLOBAL_COLORS, shuffle, rnd };