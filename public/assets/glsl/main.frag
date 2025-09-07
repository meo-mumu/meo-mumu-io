precision mediump float;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  
  // Zone rouge à gauche (0.0 à 0.5)
  if (uv.x < 0.5) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
  // Zone bleue à droite (0.5 à 1.0)  
  else {
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
  }
}