// Configuration du système de particules
export const CONFIG = {
  particleCount: 200,
  maxConnections: 80,
  connectionOpacity: 50,
  colors: ['#E84420', '#F4CD00', '#3E58E2', '#F1892A', '#22A722', '#7F3CAC', '#F391C7', '#3DC1A2'],
  physics: {
    maxSpeed: 0.8,
    damping: 0.8,
    floatAmplitude: 0.3,
    floatSpeed: 0.008
  },
  fps: {
    show: true,
    updateInterval: 20,
    backgroundColor: [0, 0, 0, 150],
    textColor: [255, 255, 255],
    fontSize: 12,
    padding: 8
  }
};