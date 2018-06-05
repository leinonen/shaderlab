import React, { Component } from 'react'
import styled from 'styled-components'

import Navigation from './Navigation'

import Toolbox from './Toolbox'
import Config from './Config'

import Button from './Button'
import Group from './Group'

import Example from './Example'
import Snippet from './Snippet'
import Link from './Link'

import exampleHippiePlasma from '../examples/2D/fun_plasma.frag'
import exampleRaymarcher from '../examples/raymarch/raymarch_cube.frag'
import exampleLattice from '../examples/raymarch/lattice.frag'
import exampleFractal from '../examples/2D/julia.frag'
import exampleMetaballs from '../examples/raymarch/metaballs_example.frag'

import basicRaymarcher from '../basics/raymarch.glsl'
import basicNormal from '../basics/normal.glsl'

import colorHsv2rgb from '../colors/hsv2rgb.glsl'

import primitiveSphere from '../primitives/sphere.glsl'
import primitiveBox from '../primitives/box.glsl'
import primitiveTorus from '../primitives/torus.glsl'
import primitivePlane from '../primitives/plane.glsl'

import operatorIntersection from '../operators/intersection.glsl'
import operatorUnion from '../operators/union.glsl'
import operatorDifference from '../operators/difference.glsl'
import operatorUnionRound from '../operators/unionRound.glsl'

const MenuBackground = styled.div`
  position: absolute;
  z-index: 1;
  pointer-events: none;
  top: 0;
  bottom: 0;
  right: 0;
  width: ${props => props.expanded ? '40rem' : '0'};
  @media screen and (max-width: 768px) {
    width: 100%;
  }
  background-color: ${props => props.expanded ? 'rgba(10,10,10,0.9)' : 'transparent'};
  transition: all 0.5s ease;
`

const MenuWrapper = styled.div`
  position: absolute;
  z-index: 4;
  top: 0;
  bottom: 0;
  right: 0;
  width: 40rem;
  background-color: rgba(10,10,10, 0.9);
  @media screen and (max-width: 768px) {
    width: 100%;
  }
  color: white;
  overflow-y: auto;
  h2 {
    color: rgba(200, 255, 0, 0.7);
  }
  h3 {
    color: rgba(255, 255, 255, 0.7);
  }
  pre {
    background-color: rgba(255, 255, 255, 0.2);
    overflow-x: auto;
  }
`
const ContentWrapper = styled.div`
  padding: 5rem 1rem;
`
class Menu extends Component {
  render() {
    const { children, expanded } = this.props
    return (
      <div>
        <MenuBackground expanded={expanded} />
        {
          expanded &&
          <MenuWrapper>
            <ContentWrapper>
              {children}
            </ContentWrapper>
          </MenuWrapper>
        }
      </div>
    )
  }
}

export default Menu
