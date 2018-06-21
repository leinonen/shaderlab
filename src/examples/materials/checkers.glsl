float checkers( vec3 p ) {
  float u = 1.0 - floor( mod( p.x, 2.0 ) );
  float v = 1.0 - floor( mod( p.z, 2.0 ) );
  if ( ( u == 1.0 && v < 1.0 ) || ( u < 1.0 && v == 1.0 ) ) {
    return 0.2;
  } else {
    return 1.0;
  }
}
