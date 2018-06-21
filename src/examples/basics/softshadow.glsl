float softShadow(vec3 ro, vec3 rd, float start, float end, float k){
  const float shadowIterations = 30;
  float shade = 1.0;
  float dist = start;
  float stepDist = end/float(shadowIterations);
  for (int i=0; i<shadowIterations; i++) {
      float h = map(ro + rd*dist);
      shade = min(shade, k*h/dist);
      dist += min(h, stepDist*2.);
      if (h<0.001 || dist > end) break; 
  }
  return min(max(shade, 0.) + 0.2, 1.0); 
}
