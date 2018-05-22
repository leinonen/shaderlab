#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdTorus( vec3 p, vec2 t ) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

vec2 kaleidoscope(vec2 p, float sections, float offset) { 
  float ma = abs(mod(atan(p.y, p.x), 2.0 * PI / sections) - PI / sections); 
  return vec2(cos(ma + offset), sin(ma + offset)) * length(p); 
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float map(vec3 p) {
  float a = PI * 2.0 * time;
  p.x += 0.9*sin(p.z);
  p.y += 0.9*cos(p.z);
p.z = mod(p.z, 1.0) - 0.5;
  
  // p.xy *= rot2( a/4.0 );
  p.xz *= rot2( 2.0 * PI * p.z / 3.0 );
  // p.xz *= rot2( a/12.0 );
  p.xy = kaleidoscope(p.xy, 32.0, 0.0);
  float t1 = sdTorus(p, vec2(2.0, 0.25));
  float t2 = sdTorus(p, vec2(2.7, 0.26));
  return min(t1,t2);
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)) - map(vec3(p.x-EPS,p.y,p.z)),
    map(vec3(p.x,p.y+EPS,p.z)) - map(vec3(p.x,p.y-EPS,p.z)),
    map(vec3(p.x,p.y,p.z+EPS)) - map(vec3(p.x,p.y,p.z-EPS))
  ));
}

void main( void ) {
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);
	
  vec3 lookAt = vec3(0.0, 0.0, 2.0 * time);
  vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z - 2.0);

  camPos.x -= 0.9*sin(camPos.z);
  camPos.y -= 0.9*cos(camPos.z);

  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 2.0);
	
  vec3 forward = normalize(lookAt + camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
		
  float FOV = 0.75;

  vec3 ro = camPos; 
  vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
  rd.xy *= rot2( PI*sin(-time*0.5)/4.0 );
  // rd.yz *= rot2( PI*sin(-time*0.5)/6.0 );
  rd.xz *= rot2( PI*sin(-time*0.5)/12.0 );	
  float t = 0.0;

  for (int i = 0 ; i < 128; i++) {
    float k = map(ro + rd * t);
    t += k * 0.75;
    if ((k < 0.01) || (t>150.)){ break; }
  }
	
  vec3 sp = ro + rd * t;

  // sp.xy *= rot2( PI * cos(time) );

  vec3 surfNormal = getNormal(sp);
  vec3 ld = lightPos - sp;

  float len = length( ld );
  ld /= len;
  float lightAtten = min( 1.0 / ( 0.125*len*len ), 1.0 );

  vec3 ref = reflect(-ld, surfNormal);
	
  float ambient = .2;
  float specularPower = 118.0;
  float diffuse = max( 0.0, dot(surfNormal, ld) );
  float specular = max( 0.0, dot( ref, normalize(camPos-sp)) );
  specular = pow(specular, specularPower);
	
  vec3 sceneColor = vec3(0.2, 0.3, 0.4) * 0.4;
  vec3 objColor = vec3(sp.z / 29.0, sp.z / 200.0, 0.4) * 0.12;
  vec3 lightColor = vec3(1.0, 0.8, 0.02);
  sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lightColor*lightAtten;

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
