precision mediump float;

#define NUM_SHOCKWAVES 10

varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 centres[NUM_SHOCKWAVES];
uniform float times[NUM_SHOCKWAVES];

// Fond gris Oslo
vec3 baseColor = vec3(0.96, 0.92, 0.86);

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    float waveSum = 0.0;

    for (int i = 0; i < NUM_SHOCKWAVES; i++) {
        float t = times[i];
        vec2 center = centres[i];

        float dist = length(uv - center);
        float waveRadius = t * 0.7 + 0.1;
        float thickness = 0.03;

        float wave = smoothstep(waveRadius - thickness, waveRadius, dist) *
                     (1.0 - smoothstep(waveRadius, waveRadius + thickness, dist));

        waveSum += wave * (1.0 - t); // Atténuation progressive
    }

    waveSum = clamp(waveSum, 0.0, 1.0);

    vec3 waveColor = mix(baseColor, vec3(0.5, 0.6, 0.6), waveSum);

    gl_FragColor = vec4(waveColor, 1.0);
}