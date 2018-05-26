#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

void main( void ) {
  const float PI = acos(-1.0);
  const float PI2 = PI * 2.0;
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float a = PI * 2.0;
  float px = 10.0 * p.x / PI2;
  float py = 10.0 * p.y / PI2;
  float ang = atan(p.x-0.5,p.y-0.5);
  float c = (3.0 * cos(10.0 * px + ang + time * PI) + 
             6.0 * sin(10.0 * py + ang + time * PI)) * sin((px + py) * PI2);
  vec3 col = sin(vec3(0.9,0.5,0.1) * time * PI + ang * 4.0) * c * exp(c/2.2);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
