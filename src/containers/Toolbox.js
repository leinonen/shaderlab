import React, { Component } from 'react';
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { selectExample } from '../store/actions'

import Button from '../components/Button'
import Group from '../components/Group'
import Example from '../components/Example'
import Snippet from '../components/Snippet'
import Link from '../components/Link'
import Menu from '../components/Menu'

import exampleHippiePlasma from '../examples/2D/fun_plasma.frag'
import exampleRaymarcher from '../examples/raymarch/raymarch_cube.frag'
import exampleLattice from '../examples/raymarch/lattice.frag'
import exampleFractal from '../examples/2D/julia.frag'
import exampleMetaballs from '../examples/raymarch/metaballs_example.frag'

import basicRaymarcher from '../examples/basics/raymarch.glsl'
import basicNormal from '../examples/basics/normal.glsl'

import colorHsv2rgb from '../examples/colors/hsv2rgb.glsl'

import primitiveSphere from '../examples/primitives/sphere.glsl'
import primitiveBox from '../examples/primitives/box.glsl'
import primitiveTorus from '../examples/primitives/torus.glsl'
import primitivePlane from '../examples/primitives/plane.glsl'

import operatorIntersection from '../examples/operators/intersection.glsl'
import operatorUnion from '../examples/operators/union.glsl'
import operatorDifference from '../examples/operators/difference.glsl'
import operatorUnionRound from '../examples/operators/unionRound.glsl'


const Item = (props) => {
  const { type } = props
  switch (type) {
    case 'example': {
      return <Example {...props} />
    }
    case 'snippet': {
      return <Snippet {...props} />
    }
    case 'link': {
      return <Link {...props} />
    }
    default:
      return null
  }
}

class Toolbox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: [
        {
          name: 'Examples',
          items: [
            { type: 'example', name: 'Plasma (Default)', source: exampleHippiePlasma, thumbnail: 'plasma.png' },
            { type: 'example', name: 'Julia Fractal', source: exampleFractal, thumbnail: 'julia.png' },
            { type: 'example', name: 'Raymarched Cube', source: exampleRaymarcher, thumbnail: 'cube.png' },
            { type: 'example', name: 'Raymarched Lattice', source: exampleLattice, thumbnail: 'lattice.png' },
            { type: 'example', name: 'Raymarched Metaballs', source: exampleMetaballs, thumbnail: 'metaballs.png' }
          ]
        },
        {
          name: 'Color Functions',
          items: [
            { type: 'snippet', name: 'HSV to RGB', source: colorHsv2rgb }
          ]
        },
        {
          name: 'Raymarching Basics',
          items: [
            { type: 'snippet', name: 'Raymarching', source: basicRaymarcher },
            { type: 'snippet', name: 'Normal / Gradient', source: basicNormal }
          ]
        },
        {
          name: 'Raymarching Primitives',
          items: [
            { type: 'snippet', name: 'Sphere', source: primitiveSphere },
            { type: 'snippet', name: 'Box', source: primitiveBox },
            { type: 'snippet', name: 'Torus', source: primitiveTorus },
            { type: 'snippet', name: 'Plane', source: primitivePlane }
          ]
        },
        {
          name: 'Raymarching Boolean Operators',
          items: [
            { type: 'snippet', name: 'Intersection', source: operatorIntersection },
            { type: 'snippet', name: 'Union', source: operatorUnion },
            { type: 'snippet', name: 'Union Round', source: operatorUnionRound },
            { type: 'snippet', name: 'Difference', source: operatorDifference }
          ]
        },
        {
          name: 'Tutorials',
          items: [
            {
              type: 'link',
              name: 'The Book of Shaders',
              url: 'https://thebookofshaders.com',
              description: 'This is a gentle step-by-step guide through the abstract and complex universe of Fragment Shaders.'
            },
            {
              type: 'link',
              name: 'Raymarching Distance Fields',
              url: 'http://9bitscience.blogspot.com/2013/07/raymarching-distance-fields_14.html',
              description: 'Good tutorial about raymarching distance fields'
            },
            {
              type: 'link',
              name: 'Ray Marching and Signed Distance Functions',
              url: 'http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/',
              description: 'Another good tutorial about raymarching distance fields'
            }
          ]
        },
        {
          name: 'Resources',
          items: [
            {
              type: 'link',
              name: 'Inigo Quilez - Articles',
              url: 'http://www.iquilezles.org',
              description: 'Many awesome articles about computer graphics, and shaders in particular. A gold mine of information'
            },
            {
              type: 'link',
              name: 'Shadertoy',
              url: 'https://shadertoy.com',
              description: 'Awesome collection of shaders, made by the community'
            },
            {
              type: 'link',
              name: 'GLSL Sandbox',
              url: 'http://glslsandbox.com',
              description: 'More shaders made by the community'
            },
            {
              type: 'link',
              name: 'hg_sdf',
              url: 'http://mercury.sexy/hg_sdf/',
              description: 'A glsl library for building signed distance functions. By demoscene group mercury'
            }
          ]
        }
      ]
    }
    this.toggleGroup = this.toggleGroup.bind(this)
  }

  toggleGroup(name) {
    this.setState({
      groups: this.state.groups.map(group => {
        if (group.name === name) {
          return { ...group, expanded: group.name === name ? !group.expanded : false }
        }
        return group;
      })
    })
  }

  render() {
    const { expanded, selectExample } = this.props
    return (
      <Menu expanded={expanded}>
        {this.state.groups.map(group => (
          <Group
            key={group.name}
            onSelectExample={selectExample}
            onExpandToggle={this.toggleGroup}
            {...group}
          >
            {
              group.items.map(item => (
                <Item key={item.name} onSelectExample={selectExample} {...item} />
              ))
            }
          </Group>
        ))
        }
      </Menu>

    )
  }
}

const mapStateToProps = null

const mapDispatchToProps = {
  selectExample
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbox);
