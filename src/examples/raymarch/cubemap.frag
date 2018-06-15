#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform samplerCube cubemap;

#define PI 3.1415926535898
#define EPS 0.0001

const float FOV = 0.75;
const int rayMarchIterations = 120;

float bumps(in vec3 p){
  return sin(p.x*16.+time*0.57)*cos(p.y*16.+time*2.17)*sin(p.z*16.-time*1.31) + 
     0.5*sin(p.x*32.+time*0.07)*cos(p.y*32.+time*2.11)*sin(p.z*32.-time*1.23);
}


mat2 rot2( float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return mat2( c, s,-s, c);
}

float sdSphere( vec3 p, float s ) {
  return length(p) - s;
}

float unionRound(float a, float b, float r) {
  vec2 u = max(vec2(r - a,r - b), vec2(0));
  return max(r, min (a, b)) - length(u);
}

float map(vec3 p) {
  float a = PI * 2.0 * time;
  vec3 p0 = p;
  // p.xz *= rot2( a/14.0 );
  vec3 offs1 = vec3(1.3 * cos( PI * time * 0.2), 
                    1.2 * sin( PI * time * 0.1), 
                    0.4 * sin(-PI * time * 0.4));
  float bu = bumps(p) * 0.009;
  return unionRound(
    sdSphere(p + bu, 0.9), 
    sdSphere(p + offs1 + bu, 0.7),
    0.25
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

vec3 fresnel( vec3 F0, vec3 h, vec3 l ) {
	return F0 + ( 1.0 - F0 ) * pow( clamp( 1.0 - dot( h, l ), 0.0, 1.0 ), 5.0 );
}

vec3 lighting(vec3 p, vec3 rd, vec3 camPos, vec3 lightPos, float dist) {
  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.125*len*len ), 1.0 );

  float ambient = .1;
  vec3 diffuse = vec3(max( 0.0, dot(normal, lightDirection) ));
  float specularPower = 13.0;
  vec3 specular = vec3(pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower));

  vec3 scaler = vec3(-1, -1, -1);
  eyeDirection *= scaler;
  lightDirection *= scaler;
  if (dist >= 150.0) {
    return textureCube(cubemap, eyeDirection).rgb;
  }
  
  float ao = 0.3 + 0.7 * calculateAO(p, normal);
  // float ratio = 1.72;
  // vec3 R = refract(eyeDirection, normalize(normal), ratio);
  vec3 R = reflect(eyeDirection, normal);
  vec3 lightColor  = vec3(1.0, 0.8, 0.3);
  
  vec3 Ks = vec3(0.9);
  vec3 Kd = vec3(0.9);
  vec3 F = fresnel( Kd, normalize( lightDirection - eyeDirection ), lightDirection );

  return (lightColor * mix(diffuse, specular, F) + textureCube(cubemap, R).rgb * fresnel( Ks, normal, -eyeDirection )) * ao;
}

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
	
  vec3 lookAt   = vec3(0.0, 0.0, 0.0);
  vec3 camPos   = lookAt + vec3(0.0, 0.0, - 2.0);
  vec3 lightPos = lookAt + vec3(-1.0, 1.0, 2.0);
	
	camPos.x = cos(PI * time*0.1)*1.;
	camPos.y = sin(PI * time*0.1)*1.;
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  
  // rd.xz *= rot2(sin(PI * time * 0.1)*PI/2.);
  // rd.yz *= rot2(sin(PI * time * 0.1)*PI/8.);
  
  float dist = rayMarch(ro, rd, 0.75, 0.01, 150.0);
  vec3 p = ro + rd * dist;
  vec3 sceneColor = lighting(p, rd, camPos, lightPos, dist);

  gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}
