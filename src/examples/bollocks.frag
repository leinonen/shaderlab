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
	return mat2( c, s,-s, c	);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float checkeredPattern( vec3 p ) {
    float k1 = 0.25;
    float k2 = k1*2.0;
	float u = k1 - floor( mod( p.x, k2 ) );
	float v = k1 - floor( mod( p.z, k2 ) );
	if ( ( u == k1 && v < k1 ) || ( u < k1 && v == k1 ) ) {
		return 0.5;
	} else {
		return 1.0;
	}
}

float box(vec3 p, vec3 b) {
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float map(vec3 p) {

    float a = PI * 1.0 * time * 0.05;

    p.xy *= rot2( (p.z / 8.0)  + a * 0.05);
    p.yz *= rot2( a/20.0 );
    p = mod(p, 2.0) - 1.0;
      
    float koff1 = sin(RAD*time*5.0)*12.0;
    koff1 += 20.0; // 30
    float koff2 = cos(RAD*time*8.0)*8.0;
    koff2 += 24.0; // 30
    float koff3 = sin(RAD*time*10.0)*15.0;
    koff3 += 30.0; // 30
    float koff = cos(RAD*time*25.0)*0.05;// 0.035;
    //koff += 0.02;
    float koff0 = sin(RAD*time)*0.5;
    koff0 += 0.98;

    float radius = 0.98;
    //radius = 0.8 + sin(RAD*time*20.0)*0.35; // uncomment for variable radius
    float d1 = koff0*sdSphere(p, radius) + koff*sin(koff1*p.x)*cos(koff2*p.y)*sin(koff3*p.z);
    float d2 =  sdSphere(p, radius);

    return  max(-d1,d2); // uncomment me
    // return d1;
}

vec3 getNormal(in vec3 p) {	
	return normalize(vec3(
		map(vec3(p.x+EPS,p.y,p.z))-map(vec3(p.x-EPS,p.y,p.z)),
		map(vec3(p.x,p.y+EPS,p.z))-map(vec3(p.x,p.y-EPS,p.z)),
		map(vec3(p.x,p.y,p.z+EPS))-map(vec3(p.x,p.y,p.z-EPS))
	));
}

void main( void ) {
	vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*vec2(resolution.x/resolution.y, 1.0);
	
	// vec3 lookAt = vec3(0.0, 0.0, 0.0);
	float offset = time*0.25;
	vec3 lookAt = vec3(0.0, 0.0, offset);  // This is the point you look towards, or at, if you prefer.
	vec3 camPos = lookAt + vec3(0.0, 0.0, lookAt.z-0.1); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.
 	vec3 light_pos = lookAt + vec3(0.0, 1.0, lookAt.z-1.0);// Put it a bit in front of the camera.
	
	vec3 forward = normalize(lookAt-camPos); // Forward vector.
	vec3 right = normalize(vec3(forward.z, 0., -forward.x )); // Right vector... or is it left? Either way, so long as the correct-facing up-vector is produced.
	vec3 up = normalize(cross(forward,right)); // Cross product the two vectors above to get the up vector.
		
	// FOV - Field of view.
	float FOV = 3.0 * PI*sin(time*0.5)/2.0;
	FOV = FOV + 5.0; // 10.75;
    
    FOV = 0.4 + sin(RAD*time*0.25)*0.4;
    FOV += 0.45;
	
	// ro - Ray origin.
	vec3 ro = camPos; 
	// rd - Ray direction.
	vec3 rd = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up);
	
	rd.xy *= rot2( PI*sin(time*0.5)/4.0 );
	rd.yz *= rot2( PI*sin(time*0.25)/6.0 );
	rd.xz *= rot2( PI*sin(time*0.4)/8.0 );

	light_pos.xy *= rot2( PI*cos(time*0.05)/8.0 );
	light_pos.yz *= rot2( PI*sin(time*0.075)/8.0 );
	// light_pos.xz *= rot2( PI*sin(time*0.95)/6.0 );
	
	float t = 0.0;

	for(int i = 0 ; i < 128; i++) {
		float k = map(camPos + rd * t);
		t += k * 0.75;
		if ((k < 0.01) || (t>150.)){ break; }
	}
	
	// Surface position.
	vec3 sp = t * rd + camPos;
	vec3 surfNormal = getNormal(sp);
	vec3 ld = light_pos - sp;

	float len = length( ld ); // Distance from the light to the surface point.
	ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
	float lightAtten = min( 1.0 / ( 0.125*len*len ), 1.0 ); // Keeps things between 0 and 1.   

		// Obtain the reflected vector at the scene position "sp."
	vec3 ref = reflect(-ld, surfNormal);
	
	float ambient = .2; //The object's ambient property.
	float specularPower = 80.0; // The power of the specularity. Higher numbers can give the object a harder, shinier look.
	float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value.
	float specular = max( 0.0, dot( ref, normalize(camPos-sp)) ); //The object's specular value.
	specular = pow(specular, specularPower); // Ramping up the specular value to the specular power for a bit of shininess.
	
    vec3 sceneColor = vec3(0.2, 0.3, 0.4) * 0.4;
    float pp = checkeredPattern(sp);
    vec3 objColor = hsv2rgb(vec3(sp.z / 16.0, sp.x, 1.0));
    vec3 lightColor = vec3(1.0);
    sceneColor += (objColor*(diffuse*0.28+ambient)+specular*0.75)*lightColor*lightAtten;

	vec3 col = clamp(sceneColor, 0.0, 1.0);
	gl_FragColor = vec4(col, 1.0);
}
