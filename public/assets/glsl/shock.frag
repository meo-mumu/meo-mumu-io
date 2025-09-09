#version 300 es

precision mediump float;

const int NUM_SHOCKWAVES = 10;

in vec2 pos;
out vec4 colour;

uniform sampler2D image;
uniform vec2 aspect;

uniform vec2[NUM_SHOCKWAVES] centres;
uniform float[NUM_SHOCKWAVES] times;

const float maxRadius = 0.5;

// SDF from https://iquilezles.org/articles/distfunctions2d/
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float getOffsetStrength(float t, vec2 dir) {
  float d = length(dir/aspect) - t * maxRadius; // SDF of circle
  // Doesn't have to be a circle!!
  // float d = sdBox(dir/aspect, vec2(t * maxRadius));
  
  d *= 1. - smoothstep(0., 0.05, abs(d)); // Mask the ripple
  
  d *= smoothstep(0., 0.05, t); // Smooth intro
  d *= 1. - smoothstep(0.1, 0.5, t); // Disparition plus rapide : 0.5-1.0 → 0.3-0.7
  return d;
}

void main() {  
  // Corriger l'axe Y inversé entre p5.js et OpenGL
  vec2 correctedPos = vec2(pos.x, 1.0 - pos.y);
  
  vec2 totalDir = vec2(0.);
  vec3 totalOffsets = vec3(0.);
  
  for(int i = 0; i < NUM_SHOCKWAVES; i ++) {
    
    vec2 centre = centres[i];
    float t = times[i];
    
    vec2 dir = centre - correctedPos;
    float tOffset = 0.01 * sin(t * 3.14);
    
    float rD = getOffsetStrength(t + tOffset, dir);
    float gD = getOffsetStrength(t, dir);
    float bD = getOffsetStrength(t - tOffset, dir);

    dir = normalize(dir);
    
    float influence = ceil(abs(gD));
    
    totalDir += dir * influence;
    totalOffsets += vec3(rD, gD, bD) * influence;
  }
  
  // Utiliser correctedPos pour la lecture de texture aussi
  float r = texture(image, correctedPos + totalDir * totalOffsets.r).r;
  float g = texture(image, correctedPos + totalDir * totalOffsets.g).g;
  float b = texture(image, correctedPos + totalDir * totalOffsets.b).b;
  
  float shading = totalOffsets.g * 8.;

  // colour = vec4(r, g, b, 1.);
  // colour.rgb += shading;
  vec3 baseColor = vec3(r, g, b);
  vec3 darkColor = vec3(0.239, 0.757, 0.635); // couleur personnalisée
  vec3 waveColor = mix(baseColor, darkColor, clamp(abs(shading), 0.0, 1.0));

  colour = vec4(waveColor, 1.0);
}






  
  