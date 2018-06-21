vec3 toGamma(vec3 v, float gamma) {
  return pow(v, vec3(1.0 / gamma)); 
}
