#ifdef GL_ES
precision mediump float;
#endif

#define EPS 0.005

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;

const float FOV = 0.75;
const int rayMarchIterations = 60;
const float PI = acos(-1.0);
const float PI2 = PI * 2.0;
const float sections = 8.0;
const float scale = 1.1;

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdMenger(vec3 p) {
  float d = sdBox(p,vec3(1.0));
  float s = 1.0;
  for( int m=0; m<3; m++ ) {
    vec3 a = mod( p*s, 2.0 )-1.0;
    s *= 3.0;
    vec3 r = abs(1.0 - 3.0 * abs(a));
    float da = max(r.x,r.y);
    float db = max(r.y,r.z);
    float dc = max(r.z,r.x);
    float c = (min(da, min(db, dc)) - 1.0) / s;
    d = max(d, c);
  }
  return d;
}

float map(vec3 p) {
  float a = PI * time;
  // p = mod(p, 2.0) - 1.0;
  p.xy *= rot2( a/4.0 );
  p.yz *= rot2( a/6.0 );
  p.xz *= rot2( a/12.0 );
  return sdMenger(p);
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

vec3 lighting(vec2 uv, vec3 p, float dist, vec3 camPos, vec3 lightPos) {
  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.125*len*len ), 1.0 );

  float ambient = .2;
  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 3.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  float ma = abs(mod(atan(uv.y, uv.x), PI2 / sections) - PI / sections) - time * PI * .05;
  uv = vec2(cos(ma), sin(ma)) * length(uv*scale);
  float mix1 = .5 + .5 * cos(16. * PI * uv.x + PI * time * .4);
  float mix2 = .5 + .5 * sin(6. * PI * uv.y);
  vec2 distort = vec2(cos(uv.x*PI+time*PI*.1), sin(uv.x*PI+time*PI*.4)) * 0.2;
  vec3 col1 = mix(texture2D(texture0, uv+distort).rgb, texture2D(texture1, uv+distort).rgb, mix1);
  vec3 col2 = texture2D(texture2, uv + -time * .1).rgb; 
  vec3 sceneColor = clamp(pow(mix(col1, col2, mix2), vec3(1.0 / .7)), 0.0, 1.0);
  
  vec3 objectColor = vec3(.8, .7, .9);
  vec3 lightColor  = vec3(1.0);
  if (dist < 150.0) {
    sceneColor = (objectColor*(diffuse*0.8+ambient)+specular*0.9)*lightColor*lightAtten;
  }
  return sceneColor;  
}

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;

  vec3 lookAt   = vec3(0.0, 0.0, 0.0);
  vec3 camPos   = lookAt + vec3(0.0, 0.0, lookAt.z - 3.0);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 3.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  float dist = rayMarch(ro, rd, 0.75, 0.01, 150.0);
  vec3 p = ro + rd * dist;
  vec3 sceneColor = lighting(uv, p, dist, camPos, lightPos);

  gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}
