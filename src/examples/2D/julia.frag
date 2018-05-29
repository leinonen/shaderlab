#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898

void main( void ) {
  vec2 p = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  float f = 1e15;
  float a = PI * time * 0.05;
  float scale = 2.5;
  vec2 z = p * scale;
  vec2 c = vec2(0.0, 1.5708);

  vec2 an = 0.51 * cos(c + a) - 0.25 * cos(c + a + a);
  for( int i=0; i<128; i++ ) {
    z = vec2( z.x*z.x-z.y*z.y, 2.0*z.x*z.y ) + an;
    f = min( f, dot(z,z) );
  }
  f = log(f) / log(1e5);
  vec3 col = vec3(f * f) * vec3(0.8, 1.0, 0.0) * 2.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
