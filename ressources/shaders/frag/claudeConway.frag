#version 300 es

precision mediump float;

in vec2 pos;
out vec4 colour;

uniform sampler2D previousGeneration;
uniform vec2 resolution;

void main() {
  vec2 uv = pos;

  // Obtenir la valeur de la cellule actuelle (canal rouge = état vivant/mort)
  float currentCell = texture(previousGeneration, uv).r;

  // Calculer la taille d'un pixel dans les coordonnées UV
  vec2 pixelSize = 1.0 / resolution;

  // Compter les voisins vivants
  float neighbors = 0.0;

  // Parcourir les 8 voisins
  neighbors += texture(previousGeneration, uv + vec2(-pixelSize.x, -pixelSize.y)).r;
  neighbors += texture(previousGeneration, uv + vec2(0.0, -pixelSize.y)).r;
  neighbors += texture(previousGeneration, uv + vec2(pixelSize.x, -pixelSize.y)).r;
  neighbors += texture(previousGeneration, uv + vec2(-pixelSize.x, 0.0)).r;
  neighbors += texture(previousGeneration, uv + vec2(pixelSize.x, 0.0)).r;
  neighbors += texture(previousGeneration, uv + vec2(-pixelSize.x, pixelSize.y)).r;
  neighbors += texture(previousGeneration, uv + vec2(0.0, pixelSize.y)).r;
  neighbors += texture(previousGeneration, uv + vec2(pixelSize.x, pixelSize.y)).r;

  // Appliquer les règles de Conway
  float newState = 0.0;

  if(currentCell > 0.5) {
    // Cellule vivante : survit avec 2 ou 3 voisins
    if(neighbors > 1.5 && neighbors < 3.5) {
      newState = 1.0;
    }
  } else {
    // Cellule morte : naît avec exactement 3 voisins
    if(neighbors > 2.5 && neighbors < 3.5) {
      newState = 1.0;
    }
  }

  // Couleurs : fond brain.js et cellules noires
  vec3 backgroundColor = vec3(244.0/255.0, 243.0/255.0, 241.0/255.0);
  vec3 cellColor = vec3(0.0, 0.0, 0.0);

  vec3 finalColor = mix(backgroundColor, cellColor, newState);

  // Stocker l'état dans le canal rouge + couleur finale
  colour = vec4(newState, finalColor.g, finalColor.b, 1.0);
}