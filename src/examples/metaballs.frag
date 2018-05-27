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

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float fOpUnionRound(float a, float b, float r) {
	vec2 u = max(vec2(r - a,r - b), vec2(0));
	return max(r, min (a, b)) - length(u);
}

float sdSphere( vec3 p, float s ) {
  return length(p) - s;
}

float sinusoidBumps(in vec3 p){
  return sin(p.x*16.+time*0.57)*cos(p.y*16.+time*2.17)*sin(p.z*16.-time*1.31) + 
     0.5*sin(p.x*32.+time*0.07)*cos(p.y*32.+time*2.11)*sin(p.z*32.-time*1.23);
}

float metaballs(vec3 p) {
    float a = PI * 2.0 * time * 0.06;
  p.xy *= rot2( a/4.0 );
  p.yz *= rot2( a/6.0 );
  p.xz *= rot2( a/12.0 );
  vec3 p1 = vec3(cos(a), sin(a), cos(a) * 0.5);
  vec3 p2 = vec3(cos(3.0*a), sin(2.0*a), sin(a) * 0.5);
  vec3 p3 = vec3(cos(a), sin(-a), cos(a) * 0.5);


  float s1 = sdSphere(p + p1, 0.4) + 0.03 * sinusoidBumps(p + p1);
  float s2 = sdSphere(p + p2, 0.6) + 0.000 * sinusoidBumps(p + p2);
  float s3 = sdSphere(p + p3, 0.8) + 0.003 * sinusoidBumps(p + p3);
  float mergeFactor = 0.4;
  return fOpUnionRound(fOpUnionRound(s1, s2, mergeFactor), s3, mergeFactor);
}

float map(vec3 p) {
  return metaballs(p);
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
	
  vec3 lookAt = vec3(0.0, 0.0, 0.0);
  vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z - 3.0);
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
	
  float ambient = .1;
  float specularPower = 18.0;
  float diffuse = max( 0.0, dot(surfNormal, ld) );
  float specular = max( 0.0, dot( ref, normalize(camPos-sp)) );
  specular = pow(specular, specularPower);
	
  vec3 sceneColor = vec3(0);
  vec3 objColor = hsv2rgb(vec3(sp.x/13.0, .7, 1.0));
  vec3 lightColor = vec3(1.0);
  sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lightColor*lightAtten;

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
