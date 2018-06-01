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

float unionRound(float a, float b, float r) {
  vec2 u = max(vec2(r - a,r - b), vec2(0));
  return max(r, min (a, b)) - length(u);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float map(vec3 p) {
  float a = PI * 2.0 * time;
  p.xy *= rot2( p.z * PI*2.0 * 0.03 );
  p = mod(p, 4.0) - 2.0;
  p.xy *= rot2( time* PI*2.0 * 0.5 );
  // p.yz *= rot2( a/6.0 );
  //p.xz *= rot2( a/12.0 );
  return unionRound(
    sdBox(p, vec3(0.75, 0.225, 0.25)),
    sdBox(p, vec3(0.25, 0.125, 1.0)), 0.6
  );
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)) - map(vec3(p.x-EPS,p.y,p.z)),
    map(vec3(p.x,p.y+EPS,p.z)) - map(vec3(p.x,p.y-EPS,p.z)),
    map(vec3(p.x,p.y,p.z+EPS)) - map(vec3(p.x,p.y,p.z-EPS))
  ));
}

float rayMarch(vec3 ro, vec3 rd, float stepSize, float minStep, float maxStep) {
  const int iterations = 50;
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

vec3 plasma(vec2 p) {
  float px = 1.5 * p.x / (PI * 2.0);
  float py = 1.5 * p.y / (PI * 2.0);
  float ang = atan(p.x-0.5, p.y-0.5);
  float c = (cos(2.0 * px + ang + time * PI * 0.1) + 
       0.5 * sin(2.0 * py + ang - time * PI * 0.1));
  return abs(sin(vec3(0.9,0.5,0.1) * time * PI*0.1 + ang * 1.0) * c * exp(c/2.2));
}

vec3 rayDirection(vec2 uv, vec3 camPos, vec3 lookAt) {
  float FOV = 0.75;
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}

float softShadow(vec3 ro, vec3 rd, float start, float end, float k){
  float shade = 1.0;
  float dist = start;
  const int shadowIterations = 60;
  float stepDist = end/float(shadowIterations);
  for (int i=0; i<shadowIterations; i++){
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


void main( void ) {
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);
	
  vec3 lookAt = vec3(0.0, 0.0, + time * 4.0);
  vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z - 2.0);
  vec3 lightPos = lookAt + vec3(0.0, 0.0, lookAt.z - 8.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  rd.xy *= rot2(PI * 2.0 * -time * 0.1);
  rd.xz *= rot2(sin(PI * 2.0 * -time * 0.1) * PI* 0.1);
  float t = rayMarch(ro, rd, 0.75, 0.01, 150.0);
  vec3 p = ro + rd * t;

  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.025*len*len ), 1.0 );

  float ambient = .2;
  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 3.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  float ao = 0.5 + 0.5 * calculateAO(p, normal);
  const float stopThreshold = 0.05; // I'm not quite sure why, but thresholds in the order of a pixel seem to work better for me... most times. 
  float shadowcol=softShadow(p, lightDirection, stopThreshold*2.0, len, 32.0);

  vec3 sceneColor = vec3(0.6, 0.1, 0.9) * 0.023;
  vec3 objectColor = hsv2rgb(vec3(p.z/10.0, 1.0, 1.0)) * plasma(normal.xy * 12.0);
  vec3 lightColor = vec3(1.3);
  sceneColor += (objectColor*(diffuse*0.8+ambient)+specular*0.2)*lightColor*lightAtten*ao*shadowcol;

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
