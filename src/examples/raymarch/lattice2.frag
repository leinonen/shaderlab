#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005

const float FOV = 0.5;
const int rayMarchIterations = 128;

mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float map(vec3 p) {
  float a = PI * 2.0 * time;
  p.xy *= rot2( PI * p.z / 8.0 );
  p = mod(p, 0.50) - 0.25;

  float d0 = sdBox(p, vec3(0.5, 0.015, 0.015));
  float d1 = sdBox(p, vec3(0.015, 0.5, 0.015));
  float d2 = sdBox(p, vec3(0.015, 0.015, 0.5)); 
  return min(min(d0, d1), d2);
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
  vec3 forward = normalize(lookAt + camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}

vec3 lighting(vec3 p, vec3 camPos, vec3 lightPos) {
  vec3 normal = getNormal(p);
  vec3 ld = lightPos - p;

  float len = length( ld );
  ld /= len;
  float lightAtten = min( 1.0 / ( 0.15*len*len ), 1.0 );

  vec3 ref = reflect(-ld, normal);
	
  float ambient = .2;
  float specularPower = 18.0;
  float diffuse = max( 0.0, dot(normal, ld) );
  float specular = max( 0.0, dot( ref, normalize(camPos -p)) );
  specular = pow(specular, specularPower);
	
  vec3 sceneColor = vec3(0.2, 0.3, 0.4) * 0.4;
  vec3 objColor   = vec3(0.0, 1.0, 0.0);
  vec3 lightColor = vec3(0.6,0.3,1.0);
  sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lightColor*lightAtten;
  return sceneColor;
}

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  vec3 lookAt = vec3(0.0, 0.0, -time);
  vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z - 2.5);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 7.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  rd.xy *= rot2( PI*sin(-time*0.5)/4.0 );
  rd.xz *= rot2( PI*sin(-time*0.5)/12.0 );

  vec3 p = ro + rd * rayMarch(ro, rd, 0.75, 0.01, 150.0);

  vec3 sceneColor = lighting(p, camPos, lightPos);

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
