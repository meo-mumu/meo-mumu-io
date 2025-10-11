#version 300 es

precision mediump float;

const int NUM_SHOCKWAVES = 10;

in vec2 pos;
out vec4 colour;

uniform sampler2D image;
uniform sampler2D backgroundImage;
uniform vec2 aspect;

uniform vec2[NUM_SHOCKWAVES] centres;
uniform float[NUM_SHOCKWAVES] times;
uniform float[NUM_SHOCKWAVES] sizes;

uniform float isHidding;
uniform float isAppear;
uniform float apparitionTime;
uniform float hideTime;
uniform float isCvMode;
uniform vec4 cvContainerBounds; // x, y, width, height du container CV
uniform vec2 screenSize; // largeur, hauteur de l'écran

const float maxRadius = 0.5;

float getOffsetStrength(float t, vec2 dir, float size) {
    float effectiveRadius = maxRadius * size;
    float d = length(dir / aspect) - t * effectiveRadius;
    d *= 1. - smoothstep(0., 0.05, abs(d));
    d *= smoothstep(0., 0.05, t);
    float fadeStart = 0.03;
    float fadeEnd = 0.12 + (size - 0.04) * 0.2;
    d *= 1. - smoothstep(fadeStart, fadeEnd, t);
    return d;
}

float getRevealMask(float t, vec2 dir, float size) {
    float effectiveRadius = maxRadius * size;
    float d = length(dir / aspect) - t * effectiveRadius;
    return 1.0 - smoothstep(-0.03, 0.03, d);
}

void main() {
    vec2 correctedPos = vec2(pos.x, 1.0 - pos.y);

    // Vérifier si le pixel est dans le container CV
    bool isInCvContainer = false;
    if (isCvMode > 0.5) {
        // Convertir pos (0-1) vers coordonnées écran WEBGL (-width/2 à +width/2, -height/2 à +height/2)
        vec2 screenPos = (correctedPos - 0.5) * screenSize; // Centré sur 0,0
        isInCvContainer = screenPos.x >= cvContainerBounds.x &&
                         screenPos.x <= cvContainerBounds.x + cvContainerBounds.z &&
                         screenPos.y >= cvContainerBounds.y &&
                         screenPos.y <= cvContainerBounds.y + cvContainerBounds.w;
    }

    // --- Calcul du masque de révélation shockwave ---
    float revealMask = 0.0;
    for (int i = 0; i < NUM_SHOCKWAVES; i++) {
        float t = times[i];
        float size = sizes[i];
        if (t < 1.0) {
            vec2 dir = centres[i] - correctedPos;
            revealMask = max(revealMask, getRevealMask(t, dir, size));
        }
    }

    // --- Calcul de l'effet d'onde ---
    vec2 totalDir = vec2(0.);
    vec3 totalOffsets = vec3(0.);
    for (int i = 0; i < NUM_SHOCKWAVES; i++) {
        float t = times[i];
        float size = sizes[i];
        if (t < 1.0) {
            vec2 dir = centres[i] - correctedPos;
            float tOffset = 0.01 * sin(t * 3.14);
            float rD = getOffsetStrength(t + tOffset, dir, size);
            float gD = getOffsetStrength(t, dir, size);
            float bD = getOffsetStrength(t - tOffset, dir, size);
            float influence = ceil(abs(gD));
            totalDir += normalize(dir) * influence;
            totalOffsets += vec3(rD, gD, bD) * influence;
        }
    }

    // --- Effet d'onde sur le texte révélé ---
    float shading = totalOffsets.g * 6.0;
    vec2 offsetR = correctedPos + totalDir * totalOffsets.r;
    vec2 offsetG = correctedPos + totalDir * totalOffsets.g;
    vec2 offsetB = correctedPos + totalDir * totalOffsets.b;
    vec3 fgColor = vec3(
        texture(image, offsetR).r,
        texture(image, offsetG).g,
        texture(image, offsetB).b
    );

    // Mode CV : ondes sans effet de noir seulement dans le container
    vec3 waveColor;
    if (isCvMode > 0.5 && isInCvContainer) {
        // Dans le container CV, juste l'effet de distorsion sans assombrir
        waveColor = fgColor;
    } else {
        // Mode normal avec effet de gris (partout ailleurs)
        waveColor = mix(fgColor, vec3(0.15, 0.15, 0.18), clamp(abs(shading), 0.0, 1.0));
    }

    vec3 bgColor = texture(backgroundImage, correctedPos).rgb;
    vec3 revealedColor = mix(bgColor, waveColor, revealMask);

    // --- Apparition centrale contrôlée par apparitionTime ---
    if (isAppear > 0.5) {
        // Fade progressif du texte pur sur le fond
        vec3 fadedText = mix(bgColor, fgColor,  clamp(pow(apparitionTime, 1.5), 0.0, 1.0));
        // Puis onde par-dessus le texte fade
        vec3 finalColor;
        if (isCvMode > 0.5 && isInCvContainer) {
            finalColor = fadedText; // Pas d'effet de gris dans le container CV
        } else {
            finalColor = mix(fadedText, vec3(0.15, 0.15, 0.18), clamp(abs(shading), 0.0, 1.0));
        }
        colour = vec4(finalColor, 1.0);
    }
    // --- Disparition centrale contrôlée par hideTime ---
    else if (isHidding > 0.5) {
        // Fade progressif du texte vers le fond (inverse de l'apparition) en logarithmique pour un effet plus rapide au début
        vec3 fadedText = mix(fgColor, bgColor, clamp(hideTime*2.0, 0.0, 1.0));
        // Puis onde par-dessus le texte fade
        vec3 finalColor;
        if (isCvMode > 0.5 && isInCvContainer) {
            finalColor = fadedText; // Pas d'effet de gris dans le container CV
        } else {
            finalColor = mix(fadedText, vec3(0.15, 0.15, 0.18), clamp(abs(shading), 0.0, 1.0));
        }
        colour = vec4(finalColor, 1.0);
    }
    else {
        // État normal : afficher le texte avec les effets de vagues
        colour = vec4(waveColor, 1.0);
    }
}