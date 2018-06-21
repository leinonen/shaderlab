#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;

const float PI = acos(-1.0);
const float PI2 = PI * 2.0;
const float sections = 5.0;
const float scale = 1.4;

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main( void ) {
  vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  p *= rot2(cos(length(p)*PI/3. + time*.2*PI)*PI/2.);
  float a = abs(mod(atan(p.y, p.x), PI2 / sections) - PI / sections) - time * PI * .05;
  p = vec2(cos(a), sin(a)) * length(p*scale);
  float mix1 = .5 + .5 * cos(16. * PI * p.x + .4 * time * PI);
  float mix2 = .5 + .5 * sin(6. * PI * p.y);
  vec2 d = .9 * vec2(cos(p.x*PI + .1*time*PI), sin(1.2*p.y*PI + .2*time*PI));
  vec3 c1 = mix(texture2D(texture0, p + d).rgb, texture2D(texture1, p + d).rgb, mix1);
  vec3 c2 = texture2D(texture2, p + .25*d - .1*time).rgb;
  c2 += .8 * c1 * hsv2rgb(vec3(d.x, 1. - d.y, 1.)); 
  gl_FragColor = vec4(clamp(pow(mix(c1, c2, mix2), vec3(1.0 / .5)), 0.0, 1.0), 1.0);
}
