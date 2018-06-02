#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005

const int marchIterations = 128;

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdCross(vec3 p, float size) {
  float d0 = sdBox(p, vec3(0.5,  size, size));
  float d1 = sdBox(p, vec3(size, 0.5,  size));
  float d2 = sdBox(p, vec3(size, size, 0.5)); 
  return min(min(d0, d1), d2);
}

float map(vec3 p) {
  p = mod(p, 1.0) - 0.5;
  return sdCross(p, 0.05);
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
  vec3 forward = normalize(lookAt + camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}

vec3 lighting(vec3 p, vec3 camPos, vec3 lightPos) {
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

  vec3 sceneColor = vec3(0.2, 0.3, 0.4) * 0.4;
  vec3 objectColor = vec3(0.0, 1.0, 0.0);
  vec3 lightColor = vec3(1.0);
  sceneColor += (objectColor*(diffuse*0.8+ambient)+specular*0.2)*lightColor*lightAtten;
  return sceneColor;
}

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  vec3 lookAt   = vec3(0.0, 0.0, -time);
  vec3 camPos   = lookAt + vec3(0.0, 0.0, lookAt.z - 2.5);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 7.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  rd.xy *= rot2( PI*sin(-time*0.5)/4.0 );
  rd.xz *= rot2( PI*sin(-time*0.5)/12.0 );

  vec3 p = ro + rd * rayMarch(ro, rd, 0.75, 0.01, 150.0);

  vec3 sceneColor = lighting(p, camPos, lightPos);

  gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}
