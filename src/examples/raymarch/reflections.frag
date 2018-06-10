#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005

const float FOV = 0.75;
const int rayMarchIterations = 80;
const int shadowIterations = 30;

const float stepSize = 0.75;
const float clipNear = 0.01;
const float clipFar = 25.0;
const float stopThreshold = 0.005;
const float stepSizeRef = 0.75;
const float clipNearRef = 0.001;

vec3 lightColor  = vec3(1.0, 1, 0.8);

struct Material {
  float ambient;
  float diffuse;
  vec3 color;
  float specularPower;
  float reflective;
  bool checkers;
};

const Material defaultMaterial = Material(0.1, 0.9, vec3(1,1,1), 4.0, 0.0, false);
const Material floorMaterial   = Material(0.1, 0.9, vec3(1,1,1), 4.0, 0.35, true);
const Material boxMaterial     = Material(0.1, 0.9, vec3(1,1,1), 134.0, 0.35, false);
const Material sphere1Material = Material(0.1, 0.9, vec3(1,.2,.2), 14.0, 0.35, false);
const Material sphere2Material = Material(0.3, 0.7, vec3(.2,1,.2), 112.0, 0.35, false);
const Material sphere3Material = Material(0.3, 0.7, vec3(.2,.2,1), 12.0, 0.35, false);
const Material worldMaterial   = Material(0.2, 0.8, vec3(1,.3,.6), 1.0, 0.35, false);

const float FLOOR_ID = 1.0;
const float BOX_ID = 2.0;
const float SPHERE1_ID = 3.0;
const float SPHERE2_ID = 4.0;
const float SPHERE3_ID = 5.0;
const float WORLD_ID = 6.0;

float sinusoidalPlasma(in vec3 p){
  return sin(p.x+time*2.)*cos(p.y+time*2.1)*sin(p.z+time*2.3) + 0.25*sin(p.x*2.)*cos(p.y*2.)*sin(p.z*2.);
}

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdSphere( vec3 p, float s ) {
  return length(p) - s;
}

float sdInvertedSphere( vec3 p, float s ) {
  return s - length(p);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float udRoundBox( vec3 p, vec3 b, float r ) {
  return length(max(abs(p)-b,0.0))-r;
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
}

vec2 sdUnion(vec2 a, vec2 b) {
  if (a.x < b.x) {
    return a;
  }
  return b;
}

float sdDiff(float distA, float distB) {
  return max(distA, -distB);
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


vec2 map(vec3 p) {
  vec2 plane = vec2(sdPlane(p, vec4(0,1,0, 1.0)), FLOOR_ID);
  vec2 world = vec2(sdInvertedSphere(p, 5.), WORLD_ID);

  vec3 p2 = p;
  p2.xz *= rot2(PI/4.0);
  p2.xy *= rot2(PI/8.0);
  p2.xz *= rot2(-time * PI * 0.1);
  modPolar(p2.xz, 5.);
  vec2 box = vec2(sdBox(p2, vec3(0.5, 0.7, 0.5)), BOX_ID);

  float a = (2.0*PI) / 3.0;
  p.xz *= rot2(time * PI * 0.3);
  float bob = 0.3*sin(0.4*time * PI);
  float cx = cos(0.)*1.3;
  float cz = sin(0.)*1.3;
  vec2 sphere1 = vec2(sdSphere(p + vec3(cx, bob, cz), .45), SPHERE1_ID);
  cx = cos(a)*1.3;
  cz = sin(a)*1.3;

  vec2 sphere2 = vec2(sdSphere(p + vec3(cx, bob, cz), .45), SPHERE2_ID);
  cx = cos(a*2.)*1.3;
  cz = sin(a*2.)*1.3;

  vec2 sphere3 = vec2(sdSphere(p + vec3(cx, bob, cz), .45), SPHERE3_ID);

  vec2 result = sdUnion(plane, box);
  result = sdUnion(result, sdUnion(sphere1, sphere2));
  result = sdUnion(result, sphere3);
  result = sdUnion(result, world);

  return result;
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)).x - map(vec3(p.x-EPS,p.y,p.z)).x,
    map(vec3(p.x,p.y+EPS,p.z)).x - map(vec3(p.x,p.y-EPS,p.z)).x,
    map(vec3(p.x,p.y,p.z+EPS)).x - map(vec3(p.x,p.y,p.z-EPS)).x
  ));
}

vec2 rayMarch(vec3 ro, vec3 rd, float stepSize, float clipNear, float clipFar) {
  float t = 0.0;
  float m = -1.0;
  for (int i = 0 ; i < rayMarchIterations; i++) {
    vec2 k = map(ro + rd * t);
    if ((k.x < clipNear) || (t > clipFar)) {
      break;
    }
    t += k.x * stepSize;
    m = k.y;
  }
  return vec2(t, m);
}

vec3 rayDirection(vec2 uv, vec3 camPos, vec3 lookAt) {
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}

float checkers( vec3 p ) {
  float u = 1.0 - floor( mod( p.x, 2.0 ) );
  float v = 1.0 - floor( mod( p.z, 2.0 ) );
  if ( ( u == 1.0 && v < 1.0 ) || ( u < 1.0 && v == 1.0 ) ) {
    return 0.2;
  } else {
    return 1.0;
  }
}

Material getObjectMaterial(vec3 p, float objId) {
  if (objId == FLOOR_ID) {
    return floorMaterial;
  } else if (objId == SPHERE1_ID) {
    return sphere1Material;
  } else if (objId == SPHERE2_ID) {
    return sphere2Material;
  } else if (objId == SPHERE3_ID) {
    return sphere3Material;
  } else if (objId == BOX_ID) {
    return boxMaterial;
  } else if (objId == WORLD_ID) {
    return worldMaterial;
  }
  return defaultMaterial;
}

float calculateAO(vec3 p, vec3 n) {
   const float AO_SAMPLES = 5.0;
   float r = 0.0;
   float w = 1.0;
   for (float i=1.0; i<=AO_SAMPLES; i++) {
      float d0 = i * 0.3;
      r += w * (d0 - map(p + n * d0).x);
      w *= 0.5;
   }
   return 1.0-clamp(r,0.0,1.0);
}

float softShadow(vec3 ro, vec3 rd, float start, float end, float k){
  float shade = 1.0;
  float dist = start;
  float stepDist = end/float(shadowIterations);
  for (int i=0; i<shadowIterations; i++){
      float h = map(ro + rd*dist).x;
      shade = min(shade, k*h/dist);
      dist += min(h, stepDist*2.);
      if (h<0.001 || dist > end) break; 
  }
  return min(max(shade, 0.) + 0.2, 1.0); 
}

vec3 lighting(vec3 p, vec3 normal, vec3 camPos, vec3 lightPos, float objId, bool reflectionPass) {
  Material material = getObjectMaterial(p, objId);
  
  if (reflectionPass && material.reflective == 0.0) {
    return vec3(0);
  }
  
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.225*len*len ), 1.0 );

  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = material.specularPower;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  float ao = 0.5 + 0.5 * calculateAO(p, normal);
  float shadowCol = 1.0;
  if (!reflectionPass) {
    float stopThreshold = 0.5;
    shadowCol = softShadow(p, lightDirection, stopThreshold * 2.0, len, 128.0);
  }
  vec3 objectColor = material.color * (material.checkers ? checkers(p*2.0) : 1.0);


  vec3 sceneColor  = vec3(0);
  sceneColor += (objectColor*(diffuse*material.diffuse+material.ambient)+specular)*lightColor*lightAtten * ao * shadowCol;

  if (reflectionPass) {
    sceneColor *= material.reflective;
  }
  return sceneColor;  
}

vec3 toGamma(vec3 v) { return pow(v, vec3(1.0 / 1.7)); }

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  vec3 lookAt   = vec3(0.0, 0.0, 0.0);
  vec3 camPos   = vec3(0.0, .3, -2.5);
  vec3 lightPos =  vec3(1.0, 1.0, -2.5);
  
  camPos.x = sin(time * PI * 0.1);
  lightPos.x = 2. * sin(-time * PI * 0.1);
  camPos.y = 0.3 + cos(time * PI * 0.23);

  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);

  // first pass
  vec2 hit = rayMarch(ro, rd, stepSize, clipNear, clipFar);
  vec3 p = ro + rd * hit.x;
  vec3 normal = getNormal(p);
  vec3 sceneColor = lighting(p, normal, camPos, lightPos, hit.y, false);
  
  float objId = hit.y;

  // reflection pass
  hit = rayMarch(p, reflect(rd, normal), stepSizeRef, clipNearRef, clipFar);
  vec3 pRef = ro + rd * hit.x;
  if (objId == WORLD_ID || hit.x >= clipFar) {
    gl_FragColor = vec4(clamp(toGamma(sceneColor), 0.0, 1.0), 1.0);
    return;
  }
  sceneColor += lighting(pRef, getNormal(pRef), pRef, lightPos, hit.y, true);

  gl_FragColor = vec4(clamp(toGamma(sceneColor), 0.0, 1.0), 1.0);
}
