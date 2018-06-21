#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;

// const float PI = 3.141592654;
const float PI = acos(-1.0);
const float PI2 = PI * 2.0;

vec2 kaleidoscope(vec2 p, float sections, float offset) {
  float ma = abs(mod(atan(p.y, p.x), PI2 / sections) - PI / sections) + offset;
  return vec2(cos(ma), sin(ma)) * length(p);
}

vec3 toGamma(vec3 v) { return pow(v, vec3(1.0 / 1.7)); }

void main( void ) {
  vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  p = kaleidoscope(p * 1.4, 8.0, time*PI*0.1);
  float px = 10.0 * p.x / PI2;
  float py = 10.0 * p.y / PI2;
  float ang = atan(p.x, p.y);
  float off = sin(length(p) * PI) * PI;
  float c = (3.0 * cos(10.0 * px + ang + time * PI + off) + 
             6.0 * sin(10.0 * py + ang + time * PI + off)) * sin((px + py + off) * PI2);

  float mix1 = 0.5 + 0.5 * cos(16. * PI * p.x + PI * time * .4);
  float mix2 = 0.5 + 0.5 * sin(6. * PI * p.y);
  vec3 col1 = mix(texture2D(texture0, p).rgb, texture2D(texture1, p).rgb, mix1);
  vec3 col2 = texture2D(texture2, -1. * p + time * .1).rgb; 
  vec3 col = mix(col1, col2, mix2);
  
  gl_FragColor = vec4(clamp(toGamma(col), 0.0, 1.0), 1.0);
}
