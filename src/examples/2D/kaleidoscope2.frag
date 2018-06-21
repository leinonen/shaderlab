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
const float sections = 8.0;
const float scale = 1.4;

void main( void ) {
  vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  float ma = abs(mod(atan(p.y, p.x), PI2 / sections) - PI / sections) - time * PI * .05;
  p = vec2(cos(ma), sin(ma)) * length(p*scale);
  float mix1 = .5 + .5 * cos(16. * PI * p.x + PI * time * .4);
  float mix2 = .5 + .5 * sin(6. * PI * p.y);
  vec3 col1 = mix(texture2D(texture0, p).rgb, texture2D(texture1, p).rgb, mix1);
  vec3 col2 = texture2D(texture2, p + -time * .1).rgb; 
  gl_FragColor = vec4(clamp(pow(mix(col1, col2, mix2), vec3(1.0 / .7)), 0.0, 1.0), 1.0);
}
