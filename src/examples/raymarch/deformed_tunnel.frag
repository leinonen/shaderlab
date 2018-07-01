#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture0;

#define PI 3.1415926535898
#define RAD PI/180.0
#define EPS 0.005

const float FOV = 0.95;
const int rayMarchIterations = 90;

const float stepSize = 0.2;
const float clipNear = 0.01;
const float clipFar = 125.0;
const float stopThreshold = 0.005;
const int LIGHTS = 2;

const float texScale = 20.0;

const float ta = 0.01815;
const float tb = 0.02555;
const float ampA = 24.0;
const float ampB = 32.0;

struct Material {
  float Ka;
  float Kd;
  float Ks;
  float specularPower; // how shiny the object is
  vec3 color;
  float Kr;      // how much light to reflect
  int materialType;
};

struct Mesh {
    float dist;
    float objId;
};
struct Light
{
    vec3 position;
    vec3 color;
};

const int MATERIAL_TYPE_SOLID = 0;
const int MATERIAL_TYPE_CHECKERS = 1;
const int MATERIAL_TYPE_WOOD = 2;
const int MATERIAL_TYPE_MARBLE = 3;

const Material defaultMaterial = Material(0.1, 0.8, 0.2, 4.0, vec3(1,1,1), 0.0, MATERIAL_TYPE_SOLID);

const Material floorMaterial   = Material(0.1, 0.8, 0.2, 4.0, vec3(1,1,1), 0.35, MATERIAL_TYPE_WOOD);
const Material boxMaterial     = Material(0.3, 0.9, 0.9, 16.0, vec3(1,1,1), 0.85, MATERIAL_TYPE_SOLID);
const Material sphere1Material = Material(0.2, 0.8, 0.9, 128.0, vec3(1,1,1), 0.0, MATERIAL_TYPE_SOLID);
const Material sphere2Material = Material(0.1, 0.8, 0.9, 128.0, vec3(.2,1,.2), 0.35, MATERIAL_TYPE_SOLID);
const Material sphere3Material = Material(0.0, 1.0, 1.0, 128.0, vec3(0,0,0), 0.95, MATERIAL_TYPE_SOLID);
const Material marbleMaterial  = Material(1.0, 0.0, 1.0, 4.0, vec3(0.1,0.3,0.4), 0.65, MATERIAL_TYPE_MARBLE);
const Material worldMaterial   = Material(0.1, 0.8, 0.2, 1.0, vec3(1,.3,.6), 0.35, MATERIAL_TYPE_SOLID);

const float FLOOR_ID = 1.0;
const float BOX_ID = 2.0;
const float SPHERE1_ID = 3.0;
const float SPHERE2_ID = 4.0;
const float SPHERE3_ID = 5.0;
const float MARBLE_ID = 6.0;
const float WORLD_ID = 7.0;

vec3 tex3D( sampler2D texChannel, in vec3 p, in vec3 n){
  vec3 blendWeight = abs(n)/1.732051;    
  blendWeight = (blendWeight - 0.2) * 7.;  // Tighten up the blending zone: 
  blendWeight = max(blendWeight, 0.001);      
  blendWeight /= (blendWeight.x + blendWeight.y + blendWeight.z );   // Force weights to sum to 1.0. 
    
	return (texture2D( texChannel, p.yz )*blendWeight.x+ 
			texture2D( texChannel, p.zx )*blendWeight.y+ 
			texture2D( texChannel, p.xy )*blendWeight.z).xyz;
}

float hash(float n) { return fract(sin(n)*4121.15393); }

float sinusoidalPlasma(in vec3 p){
  return sin(p.x+time*2.)*cos(p.y+time*2.1)*sin(p.z+time*2.3) + 0.25*sin(p.x*2.)*cos(p.y*2.)*sin(p.z*2.);
}

float sinusoidBumps(in vec3 p){
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

float sdInvertedSphere( vec3 p, float s ) {
  return s - length(p);
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}


float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
}

float sdTorus( vec3 p, vec2 t ) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

vec2 sdUnion(vec2 a, vec2 b) {
  if (a.x < b.x) {
    return a;
  }
  return b;
}

float sin3D(vec3 p) {
  return (sin(p.x*0.53)*sin(p.y*0.57)*cos(p.z*0.55)*0.57 + cos(p.x*1.03)*cos(p.y*1.05)*sin(p.z*1.07)*0.275 + sin(p.x*2.05)*sin(p.y*2.07)*sin(p.z*2.03)*0.145);
}

// I remember trying to find a faster smooth minimum function all over the net, then found this over at
// "IQuilezles.org" I should save myself the time in future, and check there first. :)
float smoothMinP( float a, float b, float smoothing ){
  float h = clamp( 0.5+0.5*(b-a)/smoothing, 0.0, 1.0 );
  return mix( b, a, h ) - smoothing*h*(1.0-h);
}

float sdTunnel(vec3 p) {
  vec2 tun1 = p.xy     - vec2(ampA*sin(p.z * ta),     ampB*cos(p.z * tb));
  vec2 tun2 = p.xy*0.8 - vec2(ampB*sin(p.z * tb*1.5), ampA*cos(p.z * ta*1.3));
  float radius = 10. + 5. * sin(p.z*0.03*PI);
  return radius - smoothMinP(length(tun1), length(tun2), 4.) + sin3D(p*0.25)*5.;
}

Mesh simpleScene(vec3 p) {
  vec2 result = vec2(sdTunnel(p), SPHERE1_ID);

  return Mesh(result.x, result.y);
}


Mesh map(vec3 p) {
  return simpleScene(p);
}

vec3 getNormal(in vec3 p) {	
  return normalize(vec3(
    map(vec3(p.x+EPS,p.y,p.z)).dist - map(vec3(p.x-EPS,p.y,p.z)).dist,
    map(vec3(p.x,p.y+EPS,p.z)).dist - map(vec3(p.x,p.y-EPS,p.z)).dist,
    map(vec3(p.x,p.y,p.z+EPS)).dist - map(vec3(p.x,p.y,p.z-EPS)).dist
  ));
}

Mesh rayMarch(vec3 ro, vec3 rd, float stepSize, float clipNear, float clipFar) {
  float t = 0.0;
  float m = -1.0;
  for (int i = 0 ; i < rayMarchIterations; i++) {
    Mesh k = map(ro + rd * t);
    if ((k.dist < clipNear) || (t > clipFar)) {
      break;
    }
    t += k.dist * stepSize;
    m = k.objId;
  }
  return Mesh(t, m);
}

vec3 rayDirection(vec2 uv, vec3 camPos, vec3 lookAt) {
  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
  vec3 up = normalize(cross(forward, right));
  return normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
}


Material getObjectMaterial(vec3 p, float objId) {  
  if (objId == FLOOR_ID) {
    return floorMaterial;
  } else if (objId == SPHERE1_ID) {
    return sphere1Material;
  } else if (objId == SPHERE2_ID) {
    return sphere2Material;
  } else if (objId == SPHERE3_ID) {
    return sphere3Material;
  } else if (objId == BOX_ID) {
    return boxMaterial;
  } else if (objId == WORLD_ID) {
    return worldMaterial;
  } else if (objId == MARBLE_ID) {
    return marbleMaterial;
  }
  return defaultMaterial;
}

float calculateAO(vec3 p, vec3 n) {
   const float AO_SAMPLES = 5.0;
   float r = 0.0;
   float w = 1.0;
   for (float i=1.0; i<=AO_SAMPLES; i++) {
      float d0 = i * 0.3;
      r += w * (d0 - map(p + n * d0).dist);
      w *= 0.5;
   }
   return 1.0-clamp(r,0.0,1.0);
}


float getGrey(vec3 p){ return p.x*0.299 + p.y*0.587 + p.z*0.114; }

vec3 doBumpMap( sampler2D texChannel, in vec3 p, in vec3 nor, float bumpfactor){
  const float eps = EPS;
  float ref = getGrey(tex3D(texChannel,  p , nor));                 
  vec3 grad = vec3( getGrey(tex3D(texChannel, vec3(p.x-eps, p.y, p.z), nor))-ref,
                    getGrey(tex3D(texChannel, vec3(p.x, p.y-eps, p.z), nor))-ref,
                    getGrey(tex3D(texChannel, vec3(p.x, p.y, p.z-eps), nor))-ref )/eps;                     
  grad -= nor*dot(nor, grad);          
  return normalize( nor + bumpfactor*grad );
}

vec3 lighting(vec3 p, float dist, vec3 normal, vec3 camPos, Light light, float objId, bool reflectionPass, float ao) {
  Material material = getObjectMaterial(p, objId);
  
  vec3 lightDirection = light.position - p;
  vec3 eyeDirection = camPos - p;

  float len = length(lightDirection);
  lightDirection /= len;
  float lightAtten = min(1.0 / ( 0.125*len*len ), 1.0 );

  float diffuse = max( 0.0, dot(normal, lightDirection) );
  float specularPower = material.specularPower;
  float specular = pow(max( 0.0, dot(reflect(-lightDirection, normal), normalize(eyeDirection)) ), specularPower);
  
  vec3 objectColor = vec3(0.);
  if (material.materialType == MATERIAL_TYPE_SOLID) objectColor = tex3D(texture0, p/texScale, normal);

  vec3 final = (objectColor*(diffuse*material.Kd + material.Ka) + specular * material.Ks) * 
         light.color * lightAtten * ao;

  // fast fog
  vec3 fogColor = vec3(.6, 1.6, .6)*.26;
  return final + .3* mix(final, fogColor, smoothstep(0.0, 1.0, dist*0.0067));
}


vec3 toGamma(vec3 v) { return pow(v, vec3(1.0 / 2.6)); }

void main( void ) {
  vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
  vec2 uv = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;

  vec3 lookAt = vec3(0.0, 0.0, -time*32.);

  vec3 camPos = lookAt + vec3(0.0, 0.0, 1.0); 
  vec3 lightPos = lookAt + vec3(0.0, 0.0, 32.0 * sin(time*.8));
  vec3 lightPos2 = lookAt + vec3(0.0, 0.0, 32.0 * sin(time*.8 + PI));

  vec3 tunnelpath    = vec3(ampA*sin(lookAt.z * ta), ampB*cos(lookAt.z * tb), 0.); // See distance field.
  vec3 tunnelpathCam = vec3(ampA*sin(camPos.z * ta), ampB*cos(camPos.z * tb), 0.); // See distance field.
  vec3 lightPath     = vec3(ampA*sin(lightPos.z * ta), ampB*cos(lightPos.z * tb), 0.); // See distance field.
  vec3 lightPath2    = vec3(ampA*sin(lightPos2.z * ta), ampB*cos(lightPos2.z * tb), 0.); // See distance field.

  lookAt += tunnelpath;
  camPos += tunnelpathCam;	
  lightPos += lightPath;
  lightPos2 += lightPath2;


  Light lights[LIGHTS];
  lights[0] = Light(lightPos, vec3(1., .6, .8)*13.);
  lights[1] = Light(lightPos2, vec3(.2, .2, .6)*13.);
  // lights[1] = Light(lightPos2, vec3(0.0,0.,1.));
  // lights[2] = Light(lightPos3, vec3(1.,1.,1.));

  vec3 ro = camPos; 
  vec3 rd = rayDirection(uv, camPos, lookAt);

  rd.xy *= rot2( PI*sin(-time*0.5)/2.0 + cos(-0.01*time * PI)*PI*1.);
//  rd.xz *= rot2( PI*sin(-time*0.8)/3.0 + cos(0.01*time * PI)*PI*2. ); 

  // first pass
  Mesh hit = rayMarch(ro, rd, stepSize, clipNear, clipFar);
  vec3 p = ro + rd * hit.dist;
  vec3 normal = getNormal(p);
  normal = doBumpMap(texture0, p/texScale, normal, .03);

  vec3 sceneColor = vec3(0.);
  float ao = 0.5 + 0.5 * calculateAO(p, normal);

  for(int i = 0; i < LIGHTS; i++) {
    sceneColor += clamp(lighting(p, hit.dist, normal, camPos, lights[i], hit.objId, false, ao), 0., 1.);
  }
  
  float objId = hit.objId;

  // world (wrapping sphere) should not reflect
  if (hit.objId == WORLD_ID) {
    gl_FragColor = vec4(clamp(toGamma(sceneColor), 0.0, 1.0), 1.0);
    return;
  }
  
  gl_FragColor = vec4(clamp(toGamma(sceneColor), 0.0, 1.0), 1.0);
}
