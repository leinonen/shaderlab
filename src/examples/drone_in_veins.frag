#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform vec4 mouse;

#define PI 3.1415926535898 
const float eps = 0.005;

const int maxIterations = 128;
const float stepScale = 0.5;
const float stopThreshold = 0.005;  

mat2 rot2( float angle ) {
	float c = cos( angle );
	float s = sin( angle );
	return mat2( c, s,-s, c	);
}



float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float sphere(in vec3 p, in vec3 centerPos, float radius){

	return length(p-centerPos) - radius;
}

float box(vec3 p, vec3 b){ 
    
	vec3 d = abs(p) - b;

	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float roundedCube(vec3 p, vec3 boxExtents, float edgeRadius ){
    
	return length(max(abs(p)-boxExtents + vec3(edgeRadius), 0.0 )) - edgeRadius;
}

// Sinusoidal plasma. 
float sinusoidalPlasma(in vec3 p){

    return sin(p.x+time*2.)*cos(p.y+time*2.1)*sin(p.z+time*2.3) + 0.25*sin(p.x*2.)*cos(p.y*2.)*sin(p.z*2.);
}

float tunnel(vec3 p)
{
	return cos(p.x)+cos(p.y*1.5)+cos(p.z)+cos(p.z*20.0)*.05;
}

    
float scene(in vec3 p) {
    //p = mod(p, 1.0) - 0.5;
    //p = mod(p, 2.0) - 1.0;
    
    float d0 = tunnel(p);
    float d1 = sphere(p, vec3(0.0,0.0,time), 0.25);

	return min(d0, d1);// + 0.03*sinusoidalPlasma(p*8.0);//+ .01-0.02*sinusoidalPlasma(p*2.0);
}

vec3 getNormal(in vec3 p) {
	
	return normalize(vec3(
		scene(vec3(p.x+eps,p.y,p.z))-scene(vec3(p.x-eps,p.y,p.z)),
		scene(vec3(p.x,p.y+eps,p.z))-scene(vec3(p.x,p.y-eps,p.z)),
		scene(vec3(p.x,p.y,p.z+eps))-scene(vec3(p.x,p.y,p.z-eps))
	));
}

float rayMarching( vec3 origin, vec3 dir, float start, float end ) {

    float sceneDist = 1e4;
	float rayDepth = start;
	for ( int i = 0; i < maxIterations; i++ ) {
		sceneDist = scene( origin + dir * rayDepth ); 

		if (( sceneDist < stopThreshold ) || (rayDepth >= end)) {
					break;
		}
		rayDepth += sceneDist * stepScale;

	}

	if ( sceneDist >= stopThreshold ) rayDepth = end;
	else rayDepth += sceneDist;
		
	return rayDepth;
}

// Based on original by IQ - optimized to remove a divide
float calculateAO(vec3 p, vec3 n)
{
   const float AO_SAMPLES = 5.0;
   float r = 0.0;
   float w = 1.0;
   for (float i=1.0; i<=AO_SAMPLES; i++)
   {
      float d0 = i * 0.15; // 1.0/AO_SAMPLES
      r += w * (d0 - scene(p + n * d0));
      w *= 0.5;
   }
   return 1.0-clamp(r,0.0,1.0);
}

vec3 lighting( vec3 sp, vec3 camPos, int reflectionPass){

    // Start with black.
    vec3 sceneColor = vec3(0.0);

    // Object's color. Most boxes are white, but I've interspersed some redish and blueish ones. I'd imagine there'd be much
    // better ways to acheive this, but it gets the job done.
    vec3 voxPos = mod(sp*0.5, 1.0);
    vec3 objColor = vec3(1.0, 1.0, 1.0);
    // if ( (voxPos.x<0.5)&&(voxPos.y>=0.5)&&(voxPos.z<0.5) ) objColor = vec3(1.0,voxPos.z*0.5,0.0);
    // else if ( (voxPos.x>=0.5)&&(voxPos.y<0.5)&&(voxPos.z>=0.5) ) objColor = vec3(0.0,0.5+voxPos.z*0.5,1.0);
    
    // I'll be doing shadows next, but for now, I've arranged for some darkish regions to move about the surface of the 
    // boxes to at least give the mild impression. 
    float fakeShadowMovement =  sinusoidalPlasma(sp*8.);
    objColor = clamp(objColor*(0.75-0.25*fakeShadowMovement), 0.0, 1.0);


    // Obtain the surface normal at the scene position "sp."
    vec3 surfNormal = getNormal(sp);

    // Lighting.

    // lp - Light position. Keeping it in the vacinity of the camera, but away from the objects in the scene.
    vec3 lp = vec3(0., 1.0, 0.0+time);
    // ld - Light direction.
    vec3 ld = lp-sp;
    // lcolor - Light color.
    vec3 lcolor = vec3(1.,0.97,0.92);
    
     // Light falloff (attenuation).
    float len = length( ld ); // Distance from the light to the surface point.
    ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
    float lightAtten = min( 1.0 / ( 0.25*len*len ), 1.0 ); // Keeps things between 0 and 1.   

    // Obtain the reflected vector at the scene position "sp."
    vec3 ref = reflect(-ld, surfNormal);
    
    float ao = 1.0;//calculateAO(sp, surfNormal); // Ambient occlusion. For this particular example, I've left it out.

    float ambient = .1; //The object's ambient property.
    float specularPower = 8.0; // The power of the specularity. Higher numbers can give the object a harder, shinier look.
    float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value.
    float specular = max( 0.0, dot( ref, normalize(camPos-sp)) ); //The object's specular value.
    specular = pow(specular, specularPower); // Ramping up the specular value to the specular power for a bit of shininess.
    	
    // Bringing all the lighting components togethr to color the screen pixel.
    sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lcolor*lightAtten*ao;
    
    return sceneColor;

}


void main(void) {
    vec2 aspect = vec2(resolution.x/resolution.y, 1.0); 
	vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*aspect;
	
    vec3 lookAt = vec3(0., 1.*sin(time*0.5), time);  
	//vec3 lookAt = vec3(0.0,0.0,0.0);
    vec3 camPos = vec3(1.0*sin(time*0.5), 0.15*sin(time*0.25), 1.0*cos(time*0.5)+time); 
    //vec3 camPos = vec3(0.0, 0.15, 2.0+time);

    vec3 forward = normalize(lookAt-camPos);
    vec3 right = normalize(vec3(forward.z, 0., -forward.x )); 
    vec3 up = normalize(cross(forward,right)); 
     
    float FOV = 0.5;
    
    // ro - Ray origin.
    vec3 ro = camPos; 
    // rd - Ray direction.
    vec3 rd = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up);
    
    //rd *= rotationMatrix(vec3(1.0,0.0,0.0), PI*0.6);
	// rd.xy *= rot2( PI*sin(-time*0.5)/4.0 );
	// rd.yz *= rot2( PI*sin(-time*0.25)/6.0 );
	// rd.xz *= rot2( PI*sin(-time*0.5)/12.0 );    

    vec3 bgcolor = vec3(0.);
	
	const float clipNear = 0.0;
	const float clipFar = 16.0;
	float dist = rayMarching(ro, rd, clipNear, clipFar );
	if ( dist >= clipFar ) {
	    gl_FragColor = vec4(bgcolor, 1.0);
	    return;
	}
	
	vec3 sp = ro + rd*dist;
	
	vec3 sceneColor = lighting( sp, camPos, 0);

	gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
	
}
