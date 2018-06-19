#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;

#define PI 3.1415926535898
#define EPS 0.0005

const int marchIterations = 120;
const int shadowIterations = 50;

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


float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float unionRound(float a, float b, float r) {
  vec2 u = max(vec2(r - a,r - b), vec2(0));
  return max(r, min (a, b)) - length(u);
}

float sdCross(vec3 p, float size) {
  float d0 = sdBox(p, vec3(0.5,  size, size));
  float d1 = sdBox(p, vec3(size, 0.5,  size));
  float d2 = sdBox(p, vec3(size, size, 0.5)); 
  // return min(min(d0, d1), d2);
  return unionRound(unionRound(d0, d1, 0.125), d2, 0.125);
}

float map(vec3 p) {
  p.xy *= rot2(PI*cos(p.z*PI*0.1 + time * 0.01 * PI));
  p = mod(p, 1.0) - 0.5;
  float c = sdCross(p, 0.05);
  float k = 0.35;
  float x = cos(p.z*PI*2. + PI/6.) * k;
  float y = sin(p.z*PI*2. + PI/6.) * k;
  float c2 = sdBox(p + vec3(x, y, 0.0), vec3(0.025, 0.025, 0.5));
  // float c3 = sdBox(p + vec3(x-0.2, y+0.2, z), vec3(0.02, 0.02, 0.5));
  // float c4 = sdBox(p + vec3(x-0.2, y-0.2, z+0.2), vec3(0.02, 0.02, 0.5));
  return min(c, c2);
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
  float FOV = 0.95;
  vec3 forward = normalize(lookAt + camPos);
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
  return min(max(shade, 0.) + 0.3, 1.0); 
}

vec3 lighting(vec3 p, float dist, vec3 camPos, vec3 lightPos, bool reflectionPass) {
  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.25*len*len ), 1.0 );

  float ambient = .2;
  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 3.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  vec3 sceneColor = vec3(0.2, 0.4, .2)*.26;
  vec3 objectColor = vec3(.6, .6, .9) * 
                     texture2D(texture0, mod(p.xy*.5 - p.xz * .5, 2.)- 1.).rgb;
  
  objectColor *= hsv2rgb(vec3((p.z) * 1.0, dist/3.6, 1.0));
  
  vec3 lightColor = vec3(1.0, 1, .5);
  const float stopThreshold = 0.5;
  float shadow = reflectionPass
    ? 1.0
    : softShadow(p, lightDirection, stopThreshold*2.0, len, 128.0);
  vec3 final = (objectColor*(diffuse*0.8+ambient)+specular*0.2)*lightColor*lightAtten * shadow;
  return mix(final, sceneColor, smoothstep(0.0, 1.0, dist/3.6));
}

vec3 toGamma(vec3 v) { return pow(v, vec3(1.0 / 1.7)); }

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  vec3 lookAt   = vec3(0.0, 0.0, -time*.5);
  vec3 camPos   = lookAt + vec3(0.0, 0.0, lookAt.z - 2.5);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 5.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  rd.xy *= rot2( PI*sin(-time*0.5)/2.0 + cos(-0.01*time * PI)*PI*1.);
  rd.xz *= rot2( PI*sin(-time*0.8)/3.0 + cos(0.01*time * PI)*PI*2. );  

  float dist = rayMarch(ro, rd, 0.2, 0.01, 150.0);
  vec3 p = ro + rd * dist;

  vec3 sceneColor = lighting(p, dist, camPos, lightPos, false);

  vec3 normal = getNormal(p);
  ro = p;
  rd = reflect(rd, normal);
  // rd = refract(rd, normal, 2.6);
  dist = rayMarch(ro, rd, 0.01, 0.001, 150.0);
  p = ro + rd * dist;

  sceneColor += lighting(p, dist, ro, lightPos, true) * 0.05;

  sceneColor = toGamma(sceneColor);

  gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}
