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

float sdSphere( vec3 p, float s ) {
  return length(p) - s;
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
}

// http://mercury.sexy/hg_sdf/
float fOpUnionRound(float a, float b, float r) {
	vec2 u = max(vec2(r - a,r - b), vec2(0));
	return max(r, min (a, b)) - length(u);
}

float metaballs(vec3 p) {
  float mergeFactor = 0.4;
  float a = PI * 2.0 * time * 0.06;
  p.xy *= rot2( a/4.0 );
  p.yz *= rot2( a/6.0 );
  p.xz *= rot2( a/12.0 );
  float s1 = sdSphere(p + vec3(cos(a),     sin(a),     cos(a) * 0.5), 0.4);
  float s2 = sdSphere(p + vec3(cos(3.0*a), sin(2.0*a), sin(a) * 0.5), 0.6);
  float s3 = sdSphere(p + vec3(cos(a),     sin(-a),    cos(a) * 0.5), 0.8);
  return fOpUnionRound(fOpUnionRound(s1, s2, mergeFactor), s3, mergeFactor);
}

float map(vec3 p) {
  return fOpUnionRound(
    sdPlane(p, vec4(0,-1,0, 1.5)), 
    fOpUnionRound(
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
  const int iterations = 70;
  float t = 0.0;
  for (int i = 0 ; i < iterations; i++) {
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

vec3 lighting(vec3 p, vec3 camPos, vec3 lightPos) {
  vec3 normal = getNormal(p);
  vec3 lightDirection = lightPos - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.125*len*len ), 1.0 );

  float ambient = .1;
  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = 5.0;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);

  vec3 sceneColor = vec3(0.6, 0.2, 0.5) * 0.4;
  vec3 objectColor = vec3(1.0, 0.1, 0.6);
  vec3 lightColor = vec3(1.0);
  sceneColor += (objectColor*(diffuse*0.8+ambient)+specular*0.2)*lightColor*lightAtten;  
  return sceneColor;
}

void main( void ) {
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);
	
  vec3 lookAt = vec3(0.0, 0.0, 0.0);
  vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z - 3.0);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 2.0);
	
  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);
  vec3 p = ro + rd * rayMarch(ro, rd, 0.75, 0.01, 150.0);

  vec3 sceneColor = lighting(p, camPos, lightPos);

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
