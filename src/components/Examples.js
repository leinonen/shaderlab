import React from 'react'
import styled from 'styled-components'

import Example from './Example'

import exampleHippiePlasma from '../examples/2D/fun_plasma.frag'
import exampleRaymarcher from '../examples/raymarch/raymarch_cube.frag'
import exampleLattice from '../examples/raymarch/lattice.frag'
import exampleFractal from '../examples/2D/julia.frag'
import exampleMetaballs from '../examples/raymarch/metaballs_example.frag'

const examples = [
  { type: 'example', name: 'Plasma-ish', source: exampleHippiePlasma, thumbnail: 'plasma.png' },
  { type: 'example', name: 'Julia Fractal', source: exampleFractal, thumbnail: 'julia.png' },
  { type: 'example', name: 'Cube', source: exampleRaymarcher, thumbnail: 'cube.png' },
  { type: 'example', name: 'Lattice', source: exampleLattice, thumbnail: 'lattice.png' },
  { type: 'example', name: 'Metaballs', source: exampleMetaballs, thumbnail: 'metaballs.png' }
]

const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
`

function Examples({onSelectExample}) {
  return (
    <Wrapper>
      {
        examples.map((example, index) =>
          <Example key={index} onSelectExample={onSelectExample} {...example} />
        )
      }
    </Wrapper>
  )
}

export default Examples
