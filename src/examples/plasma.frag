#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898

void main( void ) {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float a = PI * 2.0 * time * 0.1;
  float a2 = a * 2.0;
  float xa = p.x * PI * 2.0;
  float ya = p.y * PI * 2.0;
  float x =  8.0 * cos(xa + a2) * sin(a2 - ya) + 
             4.0 * sin(xa - a2) * sin(-a2 + ya);
  float y =  5.0 * sin(3.0 * ya - a2 + time) * cos(-a2 + xa) +
            10.0 * cos(ya - time + a2) * cos(a2 * 2.0);
  vec2 offset = vec2(x,y) * 0.7;
  float c = 0.2 * dot(offset, offset + time * 0.01);
  vec3 col = vec3(0.2, 0.1, 0.3) * c;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
