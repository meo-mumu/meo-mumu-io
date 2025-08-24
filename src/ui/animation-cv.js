// Component pour l'animation progressive des sections du CV
export function animateCVSections() {
  const elementsWithDelay = document.querySelectorAll('#cv-content [data-delay]');

  // Reset all animations
  elementsWithDelay.forEach(el => {
    el.classList.remove('animate-in');
  });

  // Trigger animations with progressive delays
  elementsWithDelay.forEach(element => {
    const delay = parseInt(element.getAttribute('data-delay')) || 0;

    setTimeout(() => {
      element.classList.add('animate-in');
    }, delay * 100); // 100ms between each animation
  });
}