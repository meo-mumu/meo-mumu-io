#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex;
uniform vec2 normalRes;

void main() {
  vec2 uv = vTexCoord;
  
  uv.y = 1.0 - uv.y;
  
  vec4 col = texture2D(tex, uv);
  float a = col.r;
  
  float num = 0.0;
  for(float i = -1.0; i < 2.0; i++) {
    for(float j = -1.0; j < 2.0; j++) {
      float x = uv.x + i * normalRes.x;
      float y = uv.y + j * normalRes.y;

      num += texture2D(tex, vec2(x, y)).r;
    }
  }
  
  num -= a;
  
  if(a > 0.5) {
    if(num < 1.5) {
      a = 0.0;
    }
    if(num > 3.5) {
      a = 0.0;
    }
  } else {
    if(num > 2.5 && num < 3.5) {
      a = 1.0;
    }
  }
  
  // Fond brain.js (244, 243, 241), cellules noires
  vec3 fondBrain = vec3(244.0/255.0, 243.0/255.0, 241.0/255.0); // Couleur brain.js
  vec3 celluleNoire = vec3(0.0, 0.0, 0.0); // Noir

  // a = 1 pour cellules vivantes (noir), a = 0 pour fond transparent
  vec3 color = mix(fondBrain, celluleNoire, a);
  gl_FragColor = vec4(color, 1.0);
}