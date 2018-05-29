import React, { Component } from 'react'
import styled from 'styled-components'

import Button from './Button'

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

const MenuWrapper = styled.div`
  position: absolute;
  z-index: 4;
  top: 0;
  bottom: 0;
  right: 0;
  width: 40rem;
  background-color: ${props => props.expanded ? 'rgba(10,10,10, 0.9)' : 'transparent'};
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

const MenuBackground = styled.div`
  position: absolute;
  z-index: 1;
  pointer-events: none;
  top: 0;
  bottom: 0;
  right: 0;
  width: ${props => props.expanded ? '40rem' : '0rem'};
  background-color: ${props => props.expanded ? 'rgba(10,10,10,0.9)' : 'transparent'};
  transition: all 0.5s ease;
`

const ContentWrapper = styled.div`
  padding: 5rem 1rem;
`

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 5;
  top: 0;
  right: 1rem;
  display: flex;
  justify-content: flex-end;
  & > button {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    padding: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
  }
`

const Row = styled.div`
margin-bottom: 0.5rem;
`

const GroupWrapper = styled.div`
  background-color: rgba(40,40,40, 0.4);
  box-sizing: border-box;
  padding: 1rem;
  margin-bottom: 2rem;
`

const GroupName = styled.h2`
  margin: 0.5rem 0;
  cursor: pointer;
`

const Item = ({ name, showSource, source, onSelectExample, url, description }) => {
  if (url) {
    return (
      <Row>
        <p><a href={url} target="_blank">{name}</a> {description}</p>
      </Row>
    )
  }
  if (!showSource) {
    return (
      <Row>
        <Button onClick={() => { onSelectExample(source) }}><span className="fa fa-bomb"></span> {name}</Button>
      </Row>
    )
  }
  return (
    <Row>
      <h3>{name}</h3>
      <pre style={{ padding: '0.5rem' }}>{source}</pre>
    </Row>
  )
}

const Group = ({ name, items, onSelectExample, expanded, onExpandToggle }) => (
  <GroupWrapper>
    <GroupName onClick={() => onExpandToggle(name)}>
      <span className={`fa fa-chevron-${expanded ? 'up' : 'down'}`}></span> {name}
    </GroupName>
    {
      expanded && items.map(item => (
        <Item key={item.name} onSelectExample={onSelectExample} {...item} />
      ))
    }
  </GroupWrapper>
)

class Menu extends Component {
  constructor(props) {
    super(props)
    this.toggleGroup = this.toggleGroup.bind(this)
    this.state = {
      groups: [
        {
          name: 'Example Shaders',
          items: [
            { name: 'Plasma (Default)', source: exampleHippiePlasma, showSource: false },
            { name: 'Julia Fractal', source: exampleFractal, showSource: false },
            { name: 'Raymarched Cube', source: exampleRaymarcher, showSource: false },
            { name: 'Raymarched Lattice', source: exampleLattice, showSource: false },
            { name: 'Raymarched Metaballs', source: exampleMetaballs, showSource: false }
          ]
        },
        {
          name: 'Color Functions',
          items: [
            { name: 'HSV to RGB', source: colorHsv2rgb, showSource: true }
          ]
        },
        {
          name: 'Raymarching Basics',
          items: [
            { name: 'Raymarching', source: basicRaymarcher, showSource: true },
            { name: 'Normal / Gradient', source: basicNormal, showSource: true }
          ]
        },
        {
          name: 'Raymarching Primitives',
          items: [
            { name: 'Sphere', source: primitiveSphere, showSource: true },
            { name: 'Box', source: primitiveBox, showSource: true },
            { name: 'Torus', source: primitiveTorus, showSource: true },
            { name: 'Plane', source: primitivePlane, showSource: true }
          ]
        },
        {
          name: 'Raymarching Boolean Operators',
          items: [
            { name: 'Intersection', source: operatorIntersection, showSource: true },
            { name: 'Union', source: operatorUnion, showSource: true },
            { name: 'Union Round', source: operatorUnionRound, showSource: true },
            { name: 'Difference', source: operatorDifference, showSource: true }
          ]
        },
        {
          name: 'Tutorials',
          items: [
            {
              name: 'The Book of Shaders',
              url: 'https://thebookofshaders.com',
              description: 'This is a gentle step-by-step guide through the abstract and complex universe of Fragment Shaders.'
            },
            {
              name: 'Raymarching Distance Fields',
              url: 'http://9bitscience.blogspot.com/2013/07/raymarching-distance-fields_14.html',
              description: 'Good tutorial about raymarching distance fields'
            },
            {
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
              name: 'Inigo Quilez - Articles',
              url: 'http://www.iquilezles.org',
              description: 'Many awesome articles about computer graphics, and shaders in particular. A gold mine of information'
            },
            {
              name: 'Shadertoy',
              url: 'https://shadertoy.com',
              description: 'Awesome collection of shaders, made by the community'
            },
            {
              name: 'GLSL Sandbox',
              url: 'http://glslsandbox.com',
              description: 'More shaders made by the community'
            },
            {
              name: 'hg_sdf',
              url: 'http://mercury.sexy/hg_sdf/',
              description: 'A glsl library for building signed distance functions. By demoscene group mercury'
            }
          ]
        }
      ]
    }
  }

  toggleGroup(name) {
    this.setState({
      groups: this.state.groups.map(group => {
        if (group.name === name) {
          return { ...group, expanded: !group.expanded }
        }
        return group
      })
    })
  }

  render() {
    const { expanded, onToggleExpanded, onEditorToggle, onSelectExample, onFullscreen, onReset } = this.props
    return (
      <div>
        <MenuBackground expanded={expanded} />
        <ButtonWrapper>
          <Button title="Factory Reset" onClick={onReset}><span className="fa fa-trash-alt"></span></Button>
          <Button title="Toggle Toolbox" onClick={onToggleExpanded}><span className="fa fa-toolbox"></span></Button>
          <Button title="Toggle Editor (Ctrl + Space)" onClick={onEditorToggle}><span className="fa fa-edit"></span></Button>
          <Button title="Fullscreen" onClick={onFullscreen}><span className="fa fa-expand-arrows-alt"></span></Button>
        </ButtonWrapper>
        {expanded && <MenuWrapper expanded={expanded}>
          <ContentWrapper>
            {this.state.groups.map(group => (
              <Group
                key={group.name}
                onSelectExample={onSelectExample}
                onExpandToggle={this.toggleGroup}
                {...group}
              />
            ))
            }
          </ContentWrapper>
        </MenuWrapper>
        }
      </div>
    )
  }
}

export default Menu
