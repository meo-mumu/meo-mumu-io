precision mediump float;
varying vec2 vTexCoord;
void main() {
  gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 0.5, 1.0);
}