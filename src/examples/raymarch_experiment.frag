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

float checkeredPattern( vec3 p ) {
  float u = 1.0 - floor( mod( p.x, 2.0 ) );
  float v = 1.0 - floor( mod( p.z, 2.0 ) );
  if ( ( u == 1.0 && v < 1.0 ) || ( u < 1.0 && v == 1.0 ) ) {
    return 0.2;
  } else {
    return 1.0;
  }
}


// Repeat around the origin by a fixed angle.
// For easier use, num of repetitions is use to specify the angle.
float pModPolar(inout vec2 p, float repetitions) {
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


float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdPlane( vec3 p, vec4 n ) {
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

// The "Round" variant uses a quarter-circle to join the two objects smoothly:
float fOpUnionRound(float a, float b, float r) {
	vec2 u = max(vec2(r - a,r - b), vec2(0));
	return max(r, min (a, b)) - length(u);
}

// first object gets a capenter-style tongue attached
float fOpTongue(float a, float b, float ra, float rb) {
	return min(a, max(a - ra, abs(b) - rb));
}

float map(vec3 p) {
  float a = PI * 2.0 * time;
  
  //p.xy *= rot2( a/4.0 );
  // p.yz *= rot2( a/6.0 );
  p.xz *= rot2( a/12.0 );

  float size = 5.0;
  // p.x = mod(p.x, size) - .5 * size;
  // p.z = mod(p.z, size) - .5 * size;

  pModPolar(p.xz, 6.0);
  p-= vec3(5, 0,0);
  
  float plane = sdPlane(p, vec4(0,1,0, 1.0));
  float box = sdBox(p,vec3(0.5, 4.0, 0.5));
  float sphere = length(p-vec3(1))-1.0;
  float d = fOpUnionRound(box, sphere, 0.5);
  d = min(plane, d);
//  float d = fOpTongue(box, sphere, 0.1, 0.3);
  float guard = -sdBox(p, vec3(size*0.5));
  guard = abs(guard) + size*0.1;

  return min(d,guard);
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)) - map(vec3(p.x-EPS,p.y,p.z)),
    map(vec3(p.x,p.y+EPS,p.z)) - map(vec3(p.x,p.y-EPS,p.z)),
    map(vec3(p.x,p.y,p.z+EPS)) - map(vec3(p.x,p.y,p.z-EPS))
  ));
}
const int maxIterationsShad = 24;

float softShadow(vec3 ro, vec3 rd, float start, float end, float k){
  float shade = 1.0;
  float dist = start;
  float stepDist = end/float(maxIterationsShad);
  for (int i=0; i<maxIterationsShad; i++){
    float h = map(ro + rd * dist);
    shade = min(shade, k*h/dist);  
    // +=h, +=clamp( h, 0.01, 0.25 ), +=min( h, 0.1 ), +=stepDist, +=min(h, stepDist*2.), etc.
    dist += min(h, stepDist*2.); // The best of both worlds... I think. 
    if (h<0.001 || dist > end) break; 
  }
  return min(max(shade, 0.) + 0.2, 1.0); 
}

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

float ray_march(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0 ; i < 128; i++) {
    float k = map(ro + rd * t);
    t += k * 0.75;
    if ((k < 0.01) || (t>150.)){ break; }
  }
  return t;
}

void main( void ) {
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);

  // Camera
  vec3 lookAt = vec3(0.0, 0.0, 0.0);
  vec3 camPos = lookAt + vec3(-6.0, 6.0, lookAt.z - 6.0);
  vec3 lightPos = lookAt + vec3(-6.0, 6.0, lookAt.z - 4.0);
	
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
		
  float FOV = 0.75;

  vec3 ro = camPos; 
  vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
  float t = ray_march(ro, rd);
  vec3 sp = ro + rd * t;
  vec3 surfNormal = getNormal(sp);
  vec3 ld = lightPos - sp;

  float len = length( ld );
  ld /= len;
  float lightAtten = min( 1.0 / ( 0.025*len*len ), 1.0 );
  vec3 ref = reflect(-ld, surfNormal);
  float ao = 0.5+0.5*calculateAO(sp, surfNormal);
	
  float ambient = .2;
  float specularPower = 118.0;
  float diffuse = max( 0.0, dot(surfNormal, ld) );
  float specular = max( 0.0, dot( ref, normalize(camPos-sp)) );
  specular = pow(specular, specularPower);

const float stopThreshold = 0.005;
float shadowcol = softShadow(sp, ld, stopThreshold*2.0, len, 32.0);
	
  vec3 sceneColor = vec3(0.0);
  vec3 objColor = vec3(1.0 / length(sp.xz)*2.0 ) * checkeredPattern(sp);
  vec3 lightColor = vec3(1.0);
  sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lightColor*lightAtten*ao;

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
