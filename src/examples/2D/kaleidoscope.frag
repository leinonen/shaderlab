#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

// const float PI = 3.141592654;
const float PI = acos(-1.0);
const float PI2 = PI * 2.0;

vec2 kaleidoscope(vec2 p, float sections, float offset) {
  float ma = abs(mod(atan(p.y, p.x), PI2 / sections) - PI / sections) + offset;
  return vec2(cos(ma), sin(ma)) * length(p);
}

void main( void ) {
  vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  p = kaleidoscope(p * 1.4, 6.0, time*PI2*0.12);
  float px = 10.0 * p.x / PI2;
  float py = 10.0 * p.y / PI2;
  float ang = atan(p.x, p.y);
  float c = (3.0 * cos(10.0 * px + ang + time * PI) + 
             6.0 * sin(10.0 * py + ang + time * PI)) * sin((px + py) * PI2);
  vec3 col = sin(vec3(0.9,0.5,0.1) * time * PI + ang * 4.0) * c * exp(c/2.2);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
