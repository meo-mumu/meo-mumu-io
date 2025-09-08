#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform float u_widht;
uniform float u_height;

void main(){
    vec2 st = vTexCoord;
    vec3 color = vec3(0.0);

    // Ratio conversion
    st.y = 1.0 - st.y;
    float aspect = float(u_widht) / float(u_height);
    vec2 pos = vec2(0.5) - st;
    pos.x *= aspect;

    float r = length(pos)*2.0;
    float a = atan(pos.y,pos.x);

    float f = cos(a*3.);
    color = vec3( 1.-smoothstep(f,f+0.02,r) );

    gl_FragColor = vec4(color, 1.0);
}
