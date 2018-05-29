#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define PI 3.1415926535898
#define EPS 0.005
#define RAD PI/180.0

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

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float map(vec3 p) {
  float a = PI * 1.0 * time * 0.2;

   p.xy *= rot2( (p.z / 1.4)  + a * 0.05);
  p.xz *= rot2( a/20.0 );
  p = mod(p, 2.0) - 1.0;
  float bb = PI* (0.4 + 0.25 *sin(time * PI * 2.0))*0.25;

  float t = sdTorus(p, vec2(0.95, bb));
  float b = sdBox(p, vec3(0.1 + bb * 0.6));
  return min(t,b);
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)) - map(vec3(p.x-EPS,p.y,p.z)),
    map(vec3(p.x,p.y+EPS,p.z)) - map(vec3(p.x,p.y-EPS,p.z)),
    map(vec3(p.x,p.y,p.z+EPS)) - map(vec3(p.x,p.y,p.z-EPS))
  ));
}

void main( void ) {
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);
	
  vec3 lookAt = vec3(0.0, 0.0, time * 0.6);
  vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z - 2.0);
  vec3 lightPos = lookAt + vec3(0.0, 1.0, lookAt.z - 2.0);
	
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
		
  float fv = cos(RAD*time*0.5)*4.0; //PI*cos(time*0.5)*4.0;
  fv += 5.0;
  float FOV = fv;//10.75;

  vec3 ro = camPos; 
  vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);

  rd.xy *= rot2( PI*sin(-time*0.15)/14.0 );
  rd.yz *= rot2( PI*sin(-time*0.18)/16.0 );
  rd.xz *= rot2( PI*sin(-time*0.15)/15.0 );

  lightPos.xy *= rot2( PI*sin(time*0.125)/2.0 );
  //lightPos.yz *= rot2( PI*sin(time*0.175)/2.0 );
  //lightPos.xz *= rot2( PI*sin(time*0.095)/2.0 );
  
	
  float t = 0.0;

  for (int i = 0 ; i < 128; i++) {
    float k = map(camPos + rd * t);
    t += k * 0.75;
    if ((k < 0.01) || (t>150.)){ break; }
  }
	
  vec3 sp = t * rd + camPos;
  vec3 surfNormal = getNormal(sp);
  vec3 ld = lightPos - sp;

  float len = length( ld );
  ld /= len;
  float lightAtten = min( 1.0 / ( 0.25*len*len ), 1.0 );

  vec3 ref = reflect(-ld, surfNormal);
	
  float ambient = .1;
  float specularPower = 122.0;
  float diffuse = max( 0.0, dot(surfNormal, ld) );
  float specular = max( 0.0, dot( ref, normalize(camPos-sp)) );
  specular = pow(specular, specularPower);
	
  vec3 sceneColor = vec3(0.0);
  vec3 objColor = hsv2rgb(vec3(sp.z / 5.0, 0.5 + 0.5 * sin(sp.z), .50));
  vec3 lightColor = vec3(1.0);
  sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lightColor*lightAtten;

  vec3 col = clamp(sceneColor, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
