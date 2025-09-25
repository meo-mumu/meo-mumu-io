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

uniform float isErasing;
uniform float isAppear;
uniform float apparitionTime;

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
    float shading = totalOffsets.g * 5.0;
    vec2 offsetR = correctedPos + totalDir * totalOffsets.r;
    vec2 offsetG = correctedPos + totalDir * totalOffsets.g;
    vec2 offsetB = correctedPos + totalDir * totalOffsets.b;
    vec3 fgColor = vec3(
        texture(image, offsetR).r,
        texture(image, offsetG).g,
        texture(image, offsetB).b
    );
    vec3 waveColor = mix(fgColor, vec3(0.15, 0.15, 0.18), clamp(abs(shading), 0.0, 1.0));
    vec3 bgColor = texture(backgroundImage, correctedPos).rgb;
    vec3 revealedColor = mix(bgColor, waveColor, revealMask);

    // --- Apparition centrale contrôlée par apparitionTime ---
    float centerFade = 0.0;
    if (isAppear > 0.5) {
        // Fade progressif du texte pur sur le fond
        vec3 fadedText = mix(bgColor, fgColor, pow(apparitionTime, 2.0));
        // Puis onde par-dessus le texte fade
        vec3 finalColor = mix(fadedText, vec3(0.15, 0.15, 0.18), clamp(abs(shading), 0.0, 1.0));
        colour = vec4(finalColor, 1.0);
    } else {
        colour = vec4(waveColor, 1.0);
    }
}