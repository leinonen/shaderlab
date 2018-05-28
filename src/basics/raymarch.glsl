float rayMarch(vec3 ro, vec3 rd, float stepSize, float minStep, float maxStep) {
  const int iterations = 128;
  float t = 0.0;
  for (int i = 0 ; i < iterations; i++) {
    float k = map(ro + rd * t);
    t += k * stepSize;
    if ((k < minStep) || (t > maxStep)) {
      break;
    }
  }
  return t;
}
