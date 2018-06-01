#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

const int marchIterations = 40;
const int shadowIterations = 14;

#define PI 3.1415926535898
#define EPS 0.005

vec3 lightPos = vec3(0);

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

float sinusoidBumps(in vec3 p){
  return sin(p.x*16.+time*0.57)*cos(p.y*16.+time*2.17)*sin(p.z*16.-time*1.31) + 
     0.5*sin(p.x*32.+time*0.07)*cos(p.y*32.+time*2.11)*sin(p.z*32.-time*1.23);
}

float unionRound(float a, float b, float r) {
  vec2 u = max(vec2(r - a,r - b), vec2(0));
  return max(r, min (a, b)) - length(u);
}

float modPolar(inout vec2 p, float repetitions) {
	float angle = 2.0*PI/repetitions;
	float a = atan(p.y, p.x) + angle/2.;
	float r = length(p);
	float c = floor(a/angle);
	a = mod(a,angle) - angle/2.;
	p = vec2(cos(a), sin(a))*r;
	if (abs(c) >= (repetitions/2.0)) c = abs(c);
	return c;
}

float modInterval(inout float p, float size, float start, float stop) {
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p+halfsize, size) - halfsize;
	if (c > stop) { //yes, this might not be the best thing numerically.
		p += size*(c - stop);
		c = stop;
	}
	if (c <start) {
		p += size*(c - start);
		c = start;
	}
	return c;
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdCylinder( vec3 p, vec3 c ) {
  return length(p.xz-c.xy)-c.z;
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
}

float sdSphere( vec3 p, float s ) {
  return length(p) - s;
}

float sdTorus( vec3 p, vec2 t ) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float pillars(vec3 p, float bumps, float pulse) {
  p.xz = mod(p.xz, 3.0) - 1.5;
  modPolar(p.xz, 5.0);
  float b = sdSphere(p + vec3(0,pulse,0) + bumps, 0.45);
  float tor = sdTorus(p, vec2(0.7, 0.08) + bumps);
  float c = sdBox(p, vec3(0.2,2.0,0.2) +bumps);
  return unionRound(min(tor,b),c, 0.4);
}

float map(vec3 p) {
  float a = PI * 2.0 * time;
  float bumps = 0.03 * sinusoidBumps(p / 2.5);
  float pulse = sin(p.z*PI / 10.0 + a)*0.50;
  // bend time and space
  p.xy *= rot2( p.z * PI*2.0 * 0.04 );
  float plane1 = sdPlane(p, vec4(vec3(0, 1,0) + vec3(0, bumps,0), 2.0));
  float plane2 = sdPlane(p, vec4(vec3(0,-1,0) + vec3(0, bumps,0), 2.0));
  return unionRound(plane1, unionRound(plane2, pillars(p, bumps, pulse), 0.8), 0.8);
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)) - map(vec3(p.x-EPS,p.y,p.z)),
    map(vec3(p.x,p.y+EPS,p.z)) - map(vec3(p.x,p.y-EPS,p.z)),
    map(vec3(p.x,p.y,p.z+EPS)) - map(vec3(p.x,p.y,p.z-EPS))
  ));
}

float rayMarch(vec3 ro, vec3 rd, float stepSize, float clipNear, float clipFar) {
  float t = 0.0;
  for (int i = 0 ; i < marchIterations; i++) {
    float k = map(ro + rd * t);
    t += k * stepSize;
    if ((k < clipNear) || (t > clipFar)) {
      break;
    }
  }
  return t;
}

float softShadow(vec3 ro, vec3 rd, float start, float end, float k){
  float shade = 1.0;
  float dist = start;
  float stepDist = end/float(shadowIterations);
  for (int i=0; i<shadowIterations; i++){
    float h = map(ro + rd*dist);
    shade = min(shade, k*h/dist);
    dist += min(h, stepDist*2.);
    if (h<0.001 || dist > end) break; 
  }
  return min(max(shade, 0.) + 0.3, 1.0); 
}

float calculateAO(vec3 p, vec3 n) {
  const float AO_SAMPLES = 5.0;
  float r = 0.0;
  float w = 1.0;
  for (float i=1.0; i<=AO_SAMPLES; i++) {
    float d0 = i * 0.3;
    r += w * (d0 - map(p + n * d0));
    w *= 0.5;
  }
  return 1.0-clamp(r,0.0,1.0);
}

vec3 rayDirection(vec2 uv, vec3 camPos, vec3 lookAt) {
  float FOV = 0.95;
  vec3 forward = normalize(lookAt + camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}

vec3 plasma(vec2 p) {
  float px = 1.5 * p.x / (PI * 2.0);
  float py = 1.5 * p.y / (PI * 2.0);
  float ang = atan(p.x-0.5, p.y-0.5);
  float c = (cos(42.0 * px + ang + time * PI * 0.1) + 
       0.5 * sin(2.0 * py + ang - time * PI * 0.1));
  return abs(sin(vec3(0.9,0.5,0.1) * time * PI*0.1 + ang * 4.0) * c * exp(c/2.2));
}

vec3 lighing(vec3 p, vec3 camPos, vec3 lookAt) {
  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.0025*len*len ), 1.0 );

  float ao = calculateAO(p, normal);
  const float stopThreshold = 0.05;
  float shadowcol=softShadow(p, lightDirection, stopThreshold*2.0, len, 128.0);
  
  float ambient = .1;
  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 13.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  vec3 sceneColor = vec3(.2, .1, .3);
  vec3 objectColor = hsv2rgb(vec3((p.x+p.y+p.z + time)/40.0, 1.0, 1.0)) + sinusoidBumps(p/5.0) * plasma(normal.xy * p.xy * 6.0) * ao*shadowcol;
  vec3 lightColor = vec3(.4, 1., .5);

  sceneColor += (objectColor*(diffuse*0.8+ambient)+specular*0.2)*lightColor*lightAtten*ao*shadowcol;
  sceneColor += plasma(p.z*0.5 +  normal.yx * 3.0) * 0.25 * diffuse*ao*shadowcol;
  return sceneColor;
}

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  float cy = 0.5 * sin(PI * 2.0 * time*0.4);
  vec3 lookAt = vec3(0, 0, time*2.);
  vec3 camPos = lookAt + vec3(0, cy, lookAt.z - 5.0);
  lightPos    = lookAt + vec3(0, cy, lookAt.z - 7.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  rd.xz *= rot2(PI * 2.0 * time * 0.1);
  rd.yz *= rot2(PI * sin(PI * time * 0.1)/5.0);

  vec3 p = ro + rd * rayMarch(ro, rd, 0.75, 0.01, 20.0);
  vec3 sceneColor = lighing(p, camPos, lightPos);

  gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}

