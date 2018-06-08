const int marchIterations = 40;
float rayMarch(vec3 ro, vec3 rd, float stepSize, float clipNear, float clipFar) {
  float t = 0.0;
  for (int i = 0 ; i < marchIterations; i++) {
    float k = map(ro + rd * t);
    t += k * stepSize;
    if ((k < clipNear) || (t > clipFar)) {
      break;
    }
  }
  return t;
}
