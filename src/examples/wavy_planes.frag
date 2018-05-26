#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p,n.xyz) + n.w;
}

float map(vec3 p) {
  float a = PI * 2.0;
  p.xz *= rot2( a/12.0 );
  float wave = (1.1 * cos(p.x * a + time * PI) + 
                1.2 * sin(p.z * a + time * PI * 10.0)) * cos(p.z + p.x + time) * 0.2;
  float p1 = sdPlane(p + vec3(0,wave,0), vec4(0,1,0, 1.0));
  float p2 = sdPlane(p + vec3(0,wave,0), vec4(0,-1,0, 4.0));
  return min(p1,p2);
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
	
  float yoff = 1.0 + sin(time * 0.3);
  vec3 lookAt = vec3(0.0, 0.0, time * 0.001);
  vec3 camPos = lookAt + vec3(0.0, yoff, lookAt.z - 2.0);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 2.0);
	
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
		
  float FOV = 0.75;

  vec3 ro = camPos; 
  vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
	
  float t = 0.0;

  for (int i = 0 ; i < 128; i++) {
    float k = map(ro + rd * t);
    t += k * 0.75;
    if ((k < 0.01) || (t>150.)){ break; }
  }
	
  vec3 sp = ro + rd * t;

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
	
  vec3 sceneColor = vec3(0.0);
  vec3 objColor = hsv2rgb(vec3((sp.x+sp.z) / 70.0, 1.0, 1.0));
  vec3 lightColor = vec3(1.0);
  sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lightColor*lightAtten;

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
