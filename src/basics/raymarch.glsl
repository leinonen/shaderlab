float rayMarch(vec3 ro, vec3 rd, float stepSize, float clipNear, float clipFar) {
  const int iterations = 40;
  float t = 0.0;
  for (int i = 0 ; i < iterations; i++) {
    float k = map(ro + rd * t);
    t += k * stepSize;
    if ((k < clipNear) || (t > clipFar)) {
      break;
    }
  }
  return t;
}
