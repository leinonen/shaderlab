#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005

const float FOV = 0.85;
const int rayMarchIterations = 20;
const int shadowIterations = 20; // increase if you have a powerful computer :)

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float modPolar(inout vec2 p, float repetitions) {
	float angle = 2.*PI/repetitions;
	float a = atan(p.y, p.x) + angle/2.;
	float r = length(p);
	float c = floor(a/angle);
	a = mod(a,angle) - angle/2.;
	p = vec2(cos(a), sin(a))*r;
	// For an odd number of repetitions, fix cell index of the cell in -x direction
	// (cell index would be e.g. -5 and 5 in the two halves of the cell):
	if (abs(c) >= (repetitions/2.)) c = abs(c);
	return c;
}

float unionRound(float a, float b, float r) {
	vec2 u = max(vec2(r - a,r - b), vec2(0));
	return max(r, min (a, b)) - length(u);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
}

float bumps(in vec3 p){
  return sin(p.x*16.+time*0.57)*cos(p.y*16.+time*2.17)*sin(p.z*16.-time*1.31) + 
     0.5*sin(p.x*32.+time*0.07)*cos(p.y*32.+time*2.11)*sin(p.z*32.-time*1.23);
}

vec3 plasma(vec2 p) {
  float px = 1.5 * p.x / (PI * 2.0);
  float py = 1.5 * p.y / (PI * 2.0);
  float ang = atan(p.x-0.5, p.y-0.5);
  float offs = time * PI * 0.1;
  float c = (cos(42.0 * px + ang + offs) + 
       0.5 * sin(12.0 * py + ang - offs));
  return (sin(vec3(0.9,0.5,0.1) * offs + ang * 4.0) * c * exp(c/2.2));
}

vec3 colorize(vec2 n) {
  return clamp(plasma(n), 0.0, 1.0)*0.5 + vec3(.4,.1,.5);
}

float pillar(vec3 p) {
  float a = PI * 2.0 * time;
  p.xz *= rot2( a/10. + sin(p.y*PI+time*PI*0.9)*PI*0.4);
  p.x += cos(p.y*PI+time*PI*0.76)*0.3;
  p.z += sin(p.y*PI+time*PI*0.3)*0.2;
  modPolar(p.xz, 6.);
  return sdBox(p, vec3(0.6, 2., 0.6) + 0.01 * bumps(p));
}

float map(vec3 p) {
  float room = min(sdPlane(p, vec4(0,1,0,2)+ 0.01 * bumps(p/4.)), sdPlane(p, vec4(0,-1,0,2)+ 0.01 * bumps(p/4.0)));
  room = unionRound(room, sdPlane(p, vec4(0,0,-1,4)+ 0.01 * bumps(p/4.)), .5);
  return unionRound(room, pillar(p), 1.2);
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
  for (int i = 0 ; i < rayMarchIterations; i++) {
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
  return min(max(shade, 0.) + 0.2, 1.0); 
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

vec3 lighting(vec3 p, vec3 camPos, vec3 lightPos) {
  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.125*len*len ), 1.0 );
  float ao = 0.5 + 0.5 * calculateAO(p, normal);
  float ambient = .2;
  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 13.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  const float stopThreshold = 0.5;
  float shadowCol = softShadow(p, lightDirection, stopThreshold*2.0, len, 128.0);

  vec3 objectColor = colorize(normal.xz);
  vec3 sceneColor  = vec3(0);
  vec3 lightColor  = vec3(1.2);

  sceneColor += (objectColor*(diffuse*0.8+ambient)+specular*0.2)*lightColor*lightAtten*ao*shadowCol;
  return sceneColor;  
}

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  vec3 lookAt   = vec3(0.0, 0.0, 0.0);
  vec3 camPos   = lookAt + vec3(2. * sin(time*PI*-0.1), sin(time*PI*-0.1), lookAt.z - 3.0);
  vec3 lightPos = lookAt + vec3(3. * sin(time*PI*0.1), -0.7, lookAt.z - 3.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  vec3 p = ro + rd * rayMarch(ro, rd, 0.75, 0.01, 150.0);
  vec3 sceneColor = lighting(p, camPos, lightPos);

  gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}
