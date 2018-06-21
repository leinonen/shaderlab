vec3 marbleTexture(vec3 p, vec3 color, float blend) {
  vec3 q = vec3( 
    fbm( p + vec3(0.0,0.0,0.) ),
    fbm( p + vec3(5.2,1.3,1.2) ),
    fbm( p + vec3(1.2,1.5,2.3) )
  );

  vec3 r = vec3( 
    fbm( p + 4.0*q + vec3(1.7,9.2,1.2) ),
    fbm( p + 4.0*q + vec3(8.3,2.8,4.3) ),
    fbm( p + 4.0*q + vec3(12.3,5.8,1.3) )
  );

  return mix(color, vec3(fbm( p + 4.0*r )), blend);
}
