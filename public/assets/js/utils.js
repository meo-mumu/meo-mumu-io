/**
 * Utility functions for maintext system - Browser compatible version
 */

window.MainTextUtils = {
  /**
   * Smoothstep function for smooth curves (equivalent to GLSL)
   */
  smoothstep: (edge0, edge1, x) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  },

  /**
   * Utility function to select font index based on thresholds
   */
  getFontIndex: (t, fontArray) => {
    let fontIndex = fontArray.findIndex(fontObj => t < fontObj.threshold);
    if (fontIndex === -1) fontIndex = fontArray.length - 1;
    return fontIndex;
  },

  /**
   * Check if mouse is hovering over text
   */
  isHoveringText: (text, x, y, spacing, mouseX, mouseY) => {
    const startX = x - (text.length * spacing) / 2 + spacing / 2;
    const endX = startX + (text.length - 1) * spacing;
    const textHeight = 40;
    
    return mouseX >= startX - spacing/2 && 
           mouseX <= endX + spacing/2 && 
           mouseY >= y - textHeight/2 && 
           mouseY <= y + textHeight/2;
  },

  /**
   * Generate random sensitivities for text letters
   */
  generateSensitivities: (length, randomFn, min = -0.2, max = 0.2) => {
    return Array.from({length}, () => randomFn(min, max));
  },

  /**
   * Mouse speed calculation helper
   */
  calculateMouseSpeed: (currentX, currentY, previousX, previousY) => {
    const deltaX = currentX - previousX;
    const deltaY = currentY - previousY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  },

  /**
   * Calculate wave size based on mouse speed with 4-state system
   */
  calculateWaveSize: (mouseSpeed, maxSpeedNormalization = 35) => {
    const minSize = 0.0;
    const maxSize = 1.2;
    const normalizedSpeed = Math.min(mouseSpeed / maxSpeedNormalization, 1.0);
    
    const threshold1 = 0.6;
    const threshold2 = 0.8;
    const threshold3 = 0.9;
    
    if (normalizedSpeed < threshold1) {
      return minSize;
    } else if (normalizedSpeed < threshold2) {
      const t = window.MainTextUtils.smoothstep(threshold1, threshold2, normalizedSpeed);
      return minSize + (maxSize * 0.0003 - minSize) * t;
    } else if (normalizedSpeed < threshold3) {
      const t = window.MainTextUtils.smoothstep(threshold2, threshold3, normalizedSpeed);
      return maxSize * 0.1 + (maxSize * 0.5 - maxSize * 0.2) * t;
    } else {
      const t = window.MainTextUtils.smoothstep(threshold3, 1.0, normalizedSpeed);
      return maxSize * 0.8 + (maxSize - maxSize * 0.9) * t;
    }
  }
};