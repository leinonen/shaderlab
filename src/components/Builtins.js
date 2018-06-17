import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  ul {
    padding: 0;
    margin: 0;
    list-style-type: none;

    li {
      color: #777;
    }
  }
`

function Builtins() {
  return (
    <Wrapper>
      <h3>Built-in Functions</h3>
      <ul>
        <li>type radians (type degrees)</li>
        <li>type degrees (type radians)</li>
        <li>type sin (type angle)</li>
        <li>type cos (type angle)</li>
        <li>type tan (type angle)</li>
        <li>type asin (type x)</li>
        <li>type acos (type x)</li>
        <li>type atan (type y, type x)</li>
        <li>type atan (type y_over_x)</li>
        <li>type sinh (type x)</li>
        <li>type cosh (type x)</li>
        <li>type tanh (type x)</li>
        <li>type asinh (type x)</li>
        <li>type acosh (type x)</li>
        <li>type atanh (type x)</li>
        <li>type pow (type x, type y)</li>
        <li>type exp (type x)</li>
        <li>type log (type x)</li>
        <li>type exp2 (type x)</li>
        <li>type log2 (type x)</li>
        <li>type sqrt (type x)</li>
        <li>type inversesqrt (type x)</li>
        <li>type abs (type x)</li>
        <li>type sign (type x)</li>
        <li>type floor (type x)</li>
        <li>type ceil (type x)</li>
        <li>type trunc (type x)</li>
        <li>type fract (type x)</li>
        <li>type mod (type x, float y)</li>
        <li>type modf (type x, out type i)</li>
        <li>type min (type x, type y)</li>
        <li>type max (type x, type y)</li>
        <li>type clamp (type x, type minV, type maxV)</li>
        <li>type mix (type x, type y, type a)</li>
        <li>type step (type edge, type x)</li>
        <li>type smoothstep (type a, type b, type x)</li>
        <li>float length (type x)</li>
        <li>float distance (type p0, type p1)</li>
        <li>float dot (type x, type y)</li>
        <li>vec3 cross (vec3 x, vec3 y)</li>
        <li>type normalize (type x)</li>
        <li>type faceforward (type N, type I, type Nref)</li>
        <li>type reflect (type I, type N)</li>
        <li>type refract (type I, type N, float eta)</li>
        <li>vec4 texture2D (sampler2D, vec2 coord)</li>
        <li>vec4 textureCube (samplerCube, vec3 direction)</li>
      </ul>
    </Wrapper>
  )
}

export default Builtins
