vec3 woodTexture(vec3 p) {
  vec3 col = vec3(0.5,0.4,0.3)*1.7;

  float f = fbm( 4.0*p*vec3(6.0,0.0,0.5) );
  col = mix( col, vec3(0.3,0.2,0.1)*1.7, f );
 
  f = fbm( 12.0*p );
  col *= 0.7+0.3*f;

  // dirt noise
  f = smoothstep( 0.0, 1.0, fbm(p*48.0) );
  f = smoothstep( 0.7,0.9,f);
  col = mix( col, vec3(0.2), f*0.1275 );

  f = smoothstep( 0.1, 1.55, length(p.xz) );
  col *= f*f*1.4;
  col.x += 0.1*(1.0-f);
  return col;
}
