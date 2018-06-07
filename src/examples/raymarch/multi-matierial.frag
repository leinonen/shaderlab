#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform vec4 mouse;

//varying vec2 surfacePosition;

#define PI 3.1415926535898 
#define TAU 6.28318530718

const float eps = 0.005; 

const int maxIterations = 128;
const float stepScale = 0.5;
const float stopThreshold = 0.005; 
const vec3	 	planeCol1		= vec3(1.0);
const vec3		planeCol2		= vec3(0.4);





//////

float sinusoidBumps(in vec3 p){
    return sin(p.x*16.+time*0.57)*cos(p.y*16.+time*2.17)*sin(p.z*16.-time*1.31) + 0.5*sin(p.x*32.+time*0.07)*cos(p.y*32.+time*2.11)*sin(p.z*32.-time*1.23);
}

float sphere(in vec3 p, in vec3 centerPos, float radius) {
	return length(p-centerPos) - radius;
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p, n.xyz) + n.w;
}

float cylinder(in vec3 p, in vec3 centerPos, float r) {
	return length(p.xz - centerPos.xz) - r;
	//return length(p.xz) - r;
}

float cylinder(in vec3 p, in vec3 centerPos, float r, float h) {
    float d = cylinder(p, centerPos, r);
    return max(d, abs(p.y) - h*0.5);
}

vec2 rotate(vec2 p, float ang) {
    float c = cos(ang), s = sin(ang);
    return vec2(p.x*c - p.y*s, p.x*s + p.y*c);
}

vec2 repeatAng(vec2 p, float n) {
    float ang = 2.0*PI/n;
    float sector = floor(atan(p.x, p.y)/ang + 0.5);
    p = rotate(p, sector*ang);
    return p;
}
vec2 opU( vec2 d1, vec2 d2 )
{
    if (d1.x < d2.x) return d1;
    return d2;
}

float udRoundBox( vec3 p, vec3 b, float r )
{
  return length(max(abs(p)-b,0.0))-r;
}

float udBox( vec3 p, vec3 b )
{
  return length(max(abs(p)-b,0.0));
}

float repeat(float coord, float spacing) {
    return mod(coord, spacing) - spacing*0.5;
}

#define SPACING          	0.2
#define RADIAL_NUM      	17.0
#define BEND             	0.99
#define TWIST            	1.6
#define GAIN             	0.5
float generateShape(in vec3 p) {
    p.xy = rotate(p.xy, -length(p.xz)*TWIST);   
    p.xy = repeatAng(p.xy, RADIAL_NUM);        
    p.yz = rotate(p.yz, -BEND);                
    p.y -= p.z*GAIN;                           
    p.z = min(p.z, 0.0);                               
    p.z = repeat(p.z, SPACING);                 
	vec3 spherePosition = vec3(0.0, 0.0, 0.0);
	float d0 = cylinder(p, spherePosition, 0.025, 1.0);//+ 0.012*sinusoidBumps(p); //  
	return d0;
}

vec2 scene(in vec3 p) {
	
    vec3 spherePosition = vec3(0.0, 0.0, 2.5);
    float d0 = sphere(p, spherePosition, 0.5);
    vec2 sp1 = vec2(d0, 1.0);

    spherePosition = vec3(1.0, 0.0, 2.5);
    d0 = sphere(p, spherePosition, 0.5);
    vec2 sp2 = vec2(d0, 2.0);

    spherePosition = vec3(-1.0, 0.0, 2.5);
    d0 = sphere(p, spherePosition, 0.5);
    vec2 sp3 = vec2(d0, 3.0);
    
    vec2 a = opU(sp1, sp2);
    vec2 b = opU(a, sp3);

    d0 = sdPlane(p, vec4(0.0,0.2,0.0,0.1));
    vec2 planes = vec2(d0, 4.0);
    vec2 res = opU(b, planes);

    return res;
}

vec3 getNormal(in vec3 pos) {
    vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
    return normalize( e.xyy*scene( pos + e.xyy ).x + 
					  e.yyx*scene( pos + e.yyx ).x + 
					  e.yxy*scene( pos + e.yxy ).x + 
					  e.xxx*scene( pos + e.xxx ).x );
	
}


vec2 rayMarching( vec3 origin, vec3 dir, float start, float end )
{
    float tmin = 1.0;
    float tmax = 20.0;
   
    float t = tmin;
    float m = -1.0;
    for( int i=0; i<maxIterations; i++ )
    {
	    float precis = 0.0005*t;
	    vec2 res = scene( origin+dir*t );
        if( res.x<precis || t>tmax ) break;
        t += res.x;
	    m = res.y;
    }

    if( t>tmax ) m=-1.0;
    return vec2( t, m );
}

vec4 basicLight(vec3 sp, vec3 surfNormal, vec3 camPos, float objId) {
	// lp - Light position. 
	//vec3 lp = vec3(1.5*sin(time*0.5), 0.75+0.25*cos(time*0.5), -1.0);
	vec3 lp = vec3(1.5, 0.75, -1.0);
	// ld - Light direction.
	vec3 ld = lp-sp;
	// lcolor - Light color
	vec3 lcolor = vec3(1.,1.,1.);
	
	// Light falloff (attenuation)
	float len = length( ld ); // Distance from the light to the surface point.
	ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
	float lightAtten = min( 1.0 / ( 0.25*len*len ), 1.0 ); // Keeps things between 0 and 1.
	
	// The unit-length, reflected vector. 
	vec3 ref = reflect(-ld, surfNormal); 
	
    // Start with black. If we had global ambient lighting, then I guess we could add it here, or later. It's a preference thing.
	vec3 sceneColor = vec3(0.0);
	
	// The spherical object's color. My favorite color is black, but I don't think that will work, so I've gone with something greenish.
	vec3 objColor = vec3(0.7, 1.0, 0.3);
    if (objId == 2.0) {
        objColor = vec3(1.0, 0.3, 0.7);
    } else if (objId == 3.0) {
        objColor = vec3(0.3, 0.7, 1.0);
    }
    
	// Fake shading
	// float bumps =  sinusoidBumps(sp);
    // objColor = clamp(objColor*0.8-vec3(0.4, 0.2, 0.1)*bumps, 0.0, 1.0);
	
	float ambient = 0.1; //The object's ambient property. You can also have a global and light ambient property, but we'll try to keep things simple.
	float specularPower = 16.0; // The power of the specularity. Higher numbers can give the object a harder, shinier look.
	float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value, which depends on the angle that the light hits the object.
	//The object's specular value, which depends on the angle that the reflected light hits the object, and the viewing angle... kind of.
	float specular = max( 0.0, dot( ref, normalize(camPos-sp)) ); 
	specular = pow(specular, specularPower); // Ramping up the specular value to the specular power for a bit of shininess.
		
	// Bringing all the lighting components together to color the screen pixel. 
	sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lcolor*lightAtten;
    return vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}
vec4 mixLight(vec3 sp, vec3 surfNormal, vec3 camPos, float objId) {
	// lp - Light position. 
	vec3 lp = vec3(1.5*sin(time*0.5), 0.75+0.25*cos(time*0.5), -2.0*sin(time));
	//vec3 lp = vec3(1.5, 0.75, -2.0);
	// ld - Light direction.
	vec3 ld = lp-sp;
	// lcolor - Light color
	vec3 lcolor = vec3(1.,0.,1.);
	
	// Light falloff (attenuation)
	float len = length( ld ); // Distance from the light to the surface point.
	ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
	float lightAtten = min( 1.0 / ( 0.25*len*len ), 1.0 ); // Keeps things between 0 and 1.
	
	// The unit-length, reflected vector. 
	vec3 ref = reflect(-ld, surfNormal); 
	
	vec3 sceneColor = vec3(0.0);
	
	vec3 objColor = vec3(0.20, 1.0, 0.20);
	/*
    if (objId == 2.0) {
        objColor = vec3(1.0, 0.3, 0.7);
    } else if (objId == 3.0) {
        objColor = vec3(0.3, 0.7, 1.0);
    } else if (objId == 4.0) {
        objColor = (mod(floor(sp.x*0.5) + floor(sp.z*0.5), 2.0) < 1.0) ? planeCol1 : planeCol2;
    }*/
    
	// Fake shading
	// float bumps =  sinusoidBumps(sp);
    // objColor = clamp(objColor*0.8-vec3(0.4, 0.2, 0.1)*bumps, 0.0, 1.0);
	
	float ambient = 0.1; //The object's ambient property. You can also have a global and light ambient property, but we'll try to keep things simple.
	float specularPower = 16.0; // The power of the specularity. Higher numbers can give the object a harder, shinier look.
	float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value, which depends on the angle that the light hits the object.
	//The object's specular value, which depends on the angle that the reflected light hits the object, and the viewing angle... kind of.
	float specular = max( 0.0, dot( ref, normalize(camPos-sp)) ); 
	specular = pow(specular, specularPower); // Ramping up the specular value to the specular power for a bit of shininess.
		
	// Bringing all the lighting components together to color the screen pixel. 
	sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5)*lcolor*lightAtten;


	// lp - Light position. 
	vec3 lp2 = vec3(-2.5*sin(time*0.5), 0.75+0.25*cos(time*0.5), -1.0);
	//vec3 lp2 = vec3(-1.5, 0.75, 2.0);
	// ld - Light direction.
	vec3 ld2 = lp2-sp;
	// lcolor - Light color
	vec3 lcolor2 = vec3(0.,0.,1.);
	
	// Light falloff (attenuation)
	float len2 = length( ld2 ); // Distance from the light to the surface point.
	ld2 /= len2; // Normalizing the light-to-surface, aka light-direction, vector.
	float lightAtten2 = min( 1.0 / ( 0.25*len2*len2 ), 1.0 ); // Keeps things between 0 and 1.
	
	// The unit-length, reflected vector. 
	vec3 ref2 = reflect(-ld2, surfNormal); 
	
    // Start with black. If we had global ambient lighting, then I guess we could add it here, or later. It's a preference thing.
	vec3 sceneColor2 = vec3(0.0);
	
	// The spherical object's color. My favorite color is black, but I don't think that will work, so I've gone with something greenish.
	
	float diffuse2 = max( 0.0, dot(surfNormal, ld2) ); //The object's diffuse value, which depends on the angle that the light hits the object.
	//The object's specular value, which depends on the angle that the reflected light hits the object, and the viewing angle... kind of.
	float specular2 = max( 0.0, dot( ref2, normalize(camPos-sp)) ); 
	specular2 = pow(specular2, specularPower); // Ramping up the specular value to the specular power for a bit of shininess.
	sceneColor2 += (objColor*(diffuse2*0.8+ambient)+specular2*0.5)*lcolor2*lightAtten2;
    
    sceneColor = sceneColor + sceneColor2;
    return vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
}

void main(void) {

    vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
	vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*aspect;

	vec3 lookAt = vec3(0.,0.0,0.);  // This is the point you look towards, or at.
	vec3 camPos = vec3(0., 0.0, -1.); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.
	// vec3 lookAt = vec3(0., 1.*sin(time*0.5), time);  // This is the point you look towards, or at, if you prefer.
	// vec3 camPos = vec3(1.0*sin(time*0.5), 0.15*sin(time*0.25), 1.0*cos(time*0.5)); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.
	// vec3 lookAt = vec3(0., 0., 0.);  // This is the point you look towards, or at, if you prefer.
	// vec3 camPos = vec3(1.0*sin(time*0.5), 0.15*sin(time*0.25), 1.0*cos(time*0.5)); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.


    // Camera setup.
    vec3 forward = normalize(lookAt-camPos); // Forward vector.
    vec3 right = normalize(vec3(forward.z, 0., -forward.x )); // Right vector... or is it left? Either way, so long as the correct-facing up-vector is produced.
    vec3 up = normalize(cross(forward,right)); // Cross product the two vectors above to get the up vector.
     
    // FOV - Field of view. Make it bigger, and the screen covers a larger area, which means more of the scene can be seen. This, in turn, means that our 
    // objects will appear smaller.
    float FOV = 0.5;
    
    // ro - Ray origin. Every ray starts from this point, then is cast in the rd direction.
    vec3 ro = camPos; 
    // rd - Ray direction. This is our one-unit-long direction ray. 
    vec3 rd = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up);
	
    // camPos - That'll allow us to move about the scene. However, movement instructions need to be made before the camera setup.
    // lookAt - We'll sometimes have to change this to suit the camera movements. Again, movement instructions need to be made before the camera setup.
    // ro - We initially set the ray origin to the camera position, but it can change to an object's surfact position when doing reflections, or checking for shadows.
    // rd - There are two different ways to raymarch. There's the discrete, incremental approach, and sphere-tracing, which tends to be more effective.	More about that later.
	
	// The screen's background color.
    vec3 bgcolor = vec3(1.,0.97,0.92)*0.15;
    float bgshade = (1.0-length(vec2(screenCoords.x/aspect.x, screenCoords.y+0.5) )*0.8);
	bgcolor *= bgshade;

	const float clipNear = 0.0;
	const float clipFar = 4.0;
	vec2 dist = rayMarching(ro, rd, clipNear, clipFar ); 
	if ( dist.x >= clipFar ) {
        // background
	    gl_FragColor = vec4(bgcolor, 1.0);
	    return;
	}
	
	vec3 sp = ro + rd*dist.x;
	
	vec3 surfNormal = getNormal(sp);
	//surfNormal = doBumpMap(sp, surfNormal, 0.025);
	
	gl_FragColor = basicLight(sp, surfNormal, camPos, dist.y);
	//gl_FragColor = mixLight(sp, surfNormal, camPos, dist.y);
	
}
