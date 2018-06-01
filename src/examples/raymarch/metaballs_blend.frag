#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005
  
const float FOV = 0.75;

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

float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
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

float wavyFloor(vec3 p) {
  float a = PI * 2.0;
  float wave = (1.1 * cos(p.x * a + time * PI) + 
                1.2 * sin(p.z * a + time * PI * 1.0)) * cos(p.z * p.x + time) * 0.2;
  return sdPlane(p + 0.3*wave, vec4(0,1,0, 1.0));
}

float map(vec3 p) {
  return fOpUnionRound(
    wavyFloor(p), 
    metaballs(p), 
    0.2
  );
}

vec3 getSceneColor(vec3 p) {
  vec3 floorColor = vec3(.2,.2,1.0);
  vec3 ballsColor = hsv2rgb(vec3(p.x/13.0, .7, 1.0));//vec3(1,1,.2);
  float r = 0.001;
  vec2 u = vec2(r - wavyFloor(p), r - metaballs(p));
  float len = length(u);

  return mix(floorColor, ballsColor, smoothstep(0.0, 1.0, len));
}
	
vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)) - map(vec3(p.x-EPS,p.y,p.z)),
    map(vec3(p.x,p.y+EPS,p.z)) - map(vec3(p.x,p.y-EPS,p.z)),
    map(vec3(p.x,p.y,p.z+EPS)) - map(vec3(p.x,p.y,p.z-EPS))
  ));
}

float softShadow(vec3 ro, vec3 rd, float start, float end, float k){
  float shade = 1.0;
  float dist = start;
  float stepDist = end/float(24);
  for (int i=0; i<24; i++){
      float h = map(ro + rd*dist);
      shade = min(shade, k*h/dist);
      dist += min(h, stepDist*2.); // The best of both worlds... I think.
      if (h<0.001 || dist > end) break; 
  }
  return min(max(shade, 0.) + 0.2, 1.0); 
}

// Based on original by IQ - optimized to remove a divide.
float calculateAO(vec3 p, vec3 n) {
   const float AO_SAMPLES = 5.0;
   float r = 0.0;
   float w = 1.0;
   for (float i=1.0; i<=AO_SAMPLES; i++)
   {
      float d0 = i * 0.2; // 1.0/AO_SAMPLES
      r += w * (d0 - map(p + n * d0));
      w *= 0.5;
   }
   return 1.0-clamp(r,0.0,1.0);
}

float rayMarch(vec3 ro, vec3 rd, float stepSize, float clipNear, float clipFar) {
  const int iterations = 40;
  float t = 0.0;
  for (int i = 0 ; i < iterations; i++) {
    float k = map(ro + rd * t);
    t += k * stepSize;
    if ((k < clipNear) || (t > clipFar)) {
      break;
    }
  }
  return t;
}

vec3 rayDirection(vec2 uv, vec3 camPos, vec3 lookAt) {
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}


vec3 lighting(vec3 p, vec3 camPos, vec3 lightPos) {
  vec3 surfNormal = getNormal(p);
  vec3 ld = lightPos - p;

  float len = length( ld );
  ld /= len;
  float lightAtten = min( 1.0 / ( 0.125*len*len ), 1.0 );

  vec3 ref = reflect(-ld, surfNormal);
  float ao = calculateAO(p, surfNormal);
	
  float ambient = .1;
  float specularPower = 18.0;
  float diffuse = max( 0.0, dot(surfNormal, ld) );
  float specular = max( 0.0, dot( ref, normalize(camPos - p)) );
  specular = pow(specular, specularPower);
  const float stopThreshold = 0.05; // I'm not quite sure why, but thresholds in the order of a pixel seem to work better for me... most times. 

  float shadowcol = softShadow(p, ld, stopThreshold*2.0, len, 32.0);
	
  vec3 sceneColor = vec3(.01,.01,.06);
  // vec3 objColor = hsv2rgb(vec3(sp.x/13.0, .7, 1.0));
  vec3 objColor = getSceneColor(p);
  vec3 lightColor = vec3(1.0);
  sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lightColor*lightAtten*ao * shadowcol;
  return sceneColor;
}

void main( void ) {
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);
	
  vec3 lookAt = vec3(0.0, 0.0, 0.0);
  vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z - 3.0);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 2.0);

  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
	
  vec3 p = ro + rd * rayMarch(ro, rd, 0.75, 0.01, 150.0);

  vec3 sceneColor = lighting(p, camPos, lightPos);
  gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}
