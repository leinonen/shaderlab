#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005

const int marchIterations = 70;
const float mergeFactor = 0.4;

const mat3 noiseMatrix = mat3( 
   0.00,  0.80,  0.60,
  -0.80,  0.36, -0.48,
  -0.60, -0.48,  0.64 
);

float hash(float n) {
  return fract(sin(n)*4121.15393);
}

float noise( in vec3 x ) {
  vec3 p = floor(x);
  vec3 f = fract(x);

  f = f*f*(3.0-2.0*f);

  float n = p.x + p.y*157.0 + 113.0*p.z;

  return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                 mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
             mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                 mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}

float fbm(vec3 p) {
    float f = 0.0;

    f += 0.5000*noise(p); p = noiseMatrix*p*2.02;
    f += 0.2500*noise(p); p = noiseMatrix*p*2.03;
    f += 0.1250*noise(p); p = noiseMatrix*p*2.01;
    f += 0.0625*noise(p);

    return f/0.9375;
}

vec3 marbleTexture(vec3 p, vec3 color, float blend) {
  vec3 q = vec3( 
    fbm( p + vec3(0.0,0.0,0.) ),
    fbm( p + vec3(5.2,1.3,1.2) ),
    fbm( p + vec3(1.2,1.5,2.3) )
  );

  vec3 r = vec3( 
    fbm( p + 4.0*q + vec3(1.7,9.2,1.2) ),
    fbm( p + 4.0*q + vec3(8.3,2.8,4.3) ),
    fbm( p + 4.0*q + vec3(12.3,5.8,1.3) )
  );

  return mix(color, vec3(fbm( p + 4.0*r )), blend);
}

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdSphere( vec3 p, float s ) {
  return length(p) - s;
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
}

float unionRound(float a, float b, float r) {
	vec2 u = max(vec2(r - a,r - b), vec2(0));
	return max(r, min (a, b)) - length(u);
}

float metaballs(vec3 p) {
  float a = PI * 2.0 * time * 0.06;
  p.xy *= rot2( a/4.0 );
  p.yz *= rot2( a/6.0 );
  p.xz *= rot2( a/12.0 );
  float s1 = sdSphere(p + vec3(cos(a),     sin(a),     cos(a) * 0.5), 0.4);
  float s2 = sdSphere(p + vec3(cos(3.0*a), sin(2.0*a), sin(a) * 0.5), 0.6);
  float s3 = sdSphere(p + vec3(cos(a),     sin(-a),    cos(a) * 0.5), 0.8);
  return unionRound(unionRound(s1, s2, mergeFactor), s3, mergeFactor);
}

float map(vec3 p) {
  return unionRound(
    sdPlane(p, vec4(0,-1,0, 1.5)), 
    unionRound(
      sdPlane(p, vec4(0,1,0, 1.5)), 
      metaballs(p), 
      0.6
    ),
    0.6
  );
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

vec3 rayDirection(vec2 uv, vec3 camPos, vec3 lookAt) {
  float FOV = 0.75;
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}

vec3 lighting(vec3 p, float dist, vec3 camPos, vec3 lightPos) {
  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.125*len*len ), 1.0 );

  float ambient  = .1;
  float diffuse  = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 15.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  vec3 fogColor  = vec3(.3, .15, .1);
  vec3 objectColor = marbleTexture(p, vec3(1), 0.8);
  vec3 lightColor  = vec3(1.0, .9, .9);
  vec3 sceneColor = (objectColor*(diffuse*0.8+ambient)+specular*0.9)*lightColor*lightAtten;  
  return mix(sceneColor, fogColor, dist/14.);
}

vec3 toGamma(vec3 v, float gamma) {
  return pow(v, vec3(1.0 / gamma)); 
}

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  vec3 lookAt   = vec3(0.0, 0.0, 0.0);
  vec3 camPos   = lookAt + vec3(0.0, 0.0, lookAt.z - 3.0);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 2.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  float dist = rayMarch(ro, rd, 0.75, 0.01, 150.0);
  vec3 p  = ro + rd * dist;

  vec3 sceneColor = lighting(p, dist, camPos, lightPos);

  gl_FragColor = vec4(clamp(toGamma(sceneColor, 1.3), 0.0, 1.0), 1.0);
}
