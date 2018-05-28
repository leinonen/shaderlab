#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

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
	// For an odd number of repetitions, fix cell index of the cell in -x direction
	// (cell index would be e.g. -5 and 5 in the two halves of the cell):
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

float map(vec3 p) {
  float a = PI * 2.0 * time;
  float bumps = 0.01 * sinusoidBumps(p / 1.5);
  float p1 = sdPlane(p, vec4(vec3(0,1,0) + vec3(0,bumps,0), 1.0));
  float p2 = sdPlane(p, vec4(vec3(0,-1,0) + vec3(0,bumps,0), 1.0));
  vec3 p0 = p;
  p.xz = mod(p.xz, 3.0) - 1.5;
  modPolar(p.xz, 8.0);
  float b = sdBox(p + vec3(0,0,0) + bumps, vec3(0.3, 0.15, 0.3));
  float c = sdBox(p, vec3(0.2,1.0,0.2) +bumps);
  c = unionRound(b,c, 0.2);
  return unionRound(p1, unionRound(p2, c, 0.2), 0.2);
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)) - map(vec3(p.x-EPS,p.y,p.z)),
    map(vec3(p.x,p.y+EPS,p.z)) - map(vec3(p.x,p.y-EPS,p.z)),
    map(vec3(p.x,p.y,p.z+EPS)) - map(vec3(p.x,p.y,p.z-EPS))
  ));
}

float rayMarch(vec3 ro, vec3 rd, float stepSize, float minStep, float maxStep) {
  const int iterations = 40;
  float t = 0.0;
  for (int i = 0 ; i < iterations; i++) {
    float k = map(ro + rd * t);
    t += k * stepSize;
    if ((k < minStep) || (t > maxStep)) {
      break;
    }
  }
  return t;
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
  return min(max(shade, 0.) + 0.1, 1.0); 
}

// Based on original by IQ - optimized to remove a divide.
float calculateAO(vec3 p, vec3 n) {
   const float AO_SAMPLES = 5.0;
   float r = 0.0;
   float w = 1.0;
   for (float i=1.0; i<=AO_SAMPLES; i++) {
      float d0 = i * 0.2; // 1.0/AO_SAMPLES
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

void main( void ) {
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);
	
  float hx = cos(0.3 * time * PI * 2.0) * 0.5;
  float hy = sin(0.03 * time * PI * 2.0) * 0.5;
  vec3 lookAt = vec3(0, 0, time);
  vec3 camPos = lookAt + vec3(hx, hy, lookAt.z - 2.0);
  lightPos = lookAt + vec3(hx,hy, lookAt.z - 5.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  rd.xz *= rot2(PI * 2.0 * time * 0.1);
  float t = rayMarch(ro, rd, 0.75, 0.01, 150.0);
  vec3 p = ro + rd * t;

  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.25*len*len ), 1.0 );

  float ao = calculateAO(p, normal);
  const float stopThreshold = 0.05; // I'm not quite sure why, but thresholds in the order of a pixel seem to work better for me... most times. 
  float shadowcol=softShadow(p, lightDirection, stopThreshold*2.0, len, 32.0);
  
  float ambient = .2;
  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 113.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  vec3 sceneColor = vec3(0);
  float bumps = sinusoidBumps(p / 4.0);
  vec3 objectColor = hsv2rgb(vec3(0.13*bumps + (p.x + p.z + p.y* 2.0) / 15.0, 1.0 - 0.4 * bumps, 1.0 - 0.3 * bumps));
  vec3 lightColor = vec3(1.0);
  sceneColor += (objectColor*(diffuse*0.8+ambient)+specular*0.2)*lightColor*lightAtten*ao*shadowcol;

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
