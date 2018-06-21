const mat3 noiseMatrix = mat3( 
   0.00,  0.80,  0.60,
  -0.80,  0.36, -0.48,
  -0.60, -0.48,  0.64 
);

float hash(float n) {
  return fract(sin(n)*4121.15393);
}

float noise( in vec3 x ) {
  vec3 p = floor(x);
  vec3 f = fract(x);

  f = f*f*(3.0-2.0*f);

  float n = p.x + p.y*157.0 + 113.0*p.z;

  return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                 mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
             mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                 mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}

float fbm(vec3 p) {
  float f = 0.0;

  f += 0.5000*noise(p); p = noiseMatrix*p*2.02;
  f += 0.2500*noise(p); p = noiseMatrix*p*2.03;
  f += 0.1250*noise(p); p = noiseMatrix*p*2.01;
  f += 0.0625*noise(p);

  return f/0.9375;
}
