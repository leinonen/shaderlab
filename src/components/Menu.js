import React, { Component } from 'react'
import styled from 'styled-components'

import Button from './Button'

import exampleHippiePlasma from '../examples/fun_plasma.frag'
import exampleRaymarcher from '../examples/raymarch_cube.frag'
import exampleLattice from '../examples/lattice.frag'

import primitiveSphere from '../primitives/sphere.glsl'
import primitiveBox from '../primitives/box.glsl'
import primitiveTorus from '../primitives/torus.glsl'
import primitivePlane from '../primitives/plane.glsl'

import operatorIntersection from '../operators/intersection.glsl'
import operatorUnion from '../operators/union.glsl'
import operatorDifference from '../operators/difference.glsl'

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

const Item = ({ name, showSource, source, onSelectExample }) => {
  if (!showSource) {
    return (
      <Row>
        <Button onClick={() => { onSelectExample(source) }}>{name}</Button>
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

const Group = ({ name, items, onSelectExample }) => (
  <GroupWrapper>
    <h2>{name}</h2>
    {
      items.map(item => <Item key={item.name} onSelectExample={onSelectExample} {...item} />)
    }
  </GroupWrapper>
)

class Menu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: [
        {
          name: 'Example shaders',
          items: [
            { name: 'Plasma (Default)', source: exampleHippiePlasma, showSource: false },
            { name: 'Raymarched Cube', source: exampleRaymarcher, showSource: false },
            { name: 'Raymarched Lattice', source: exampleLattice, showSource: false }
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
            { name: 'Difference', source: operatorDifference, showSource: true }
          ]
        }
      ]
    }
  }

  render() {
    const { expanded, onToggleExpanded, onEditorToggle, onSelectExample, onFullscreen } = this.props
    return (
      <div>
        <MenuBackground expanded={expanded} />
        <ButtonWrapper>
          <Button title="Factory Reset"><span className="fa fa-trash-alt"></span></Button>
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
                {...group}
              />
            ))
            }
            <div>
              <h4>Sources, credits and resources</h4>
              <p>I did not come up with all this stuff, just wanted to make the information easily accessible when hacking.</p>
              <ul>
                <li><a href="http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm">Inigo Quilez - Distance Functions</a></li>
                <li><a href="http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions">Jamie Wong - Raymarching Distance Functions</a></li>
                <li><a href="http://www.pouet.net/topic.php?which=7931&page=1">Pouet.net - Raymarching Toolbox Forum</a></li>
                <li><a href="https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.40.pdf">GLSL Specification 4.40 - PDF</a></li>
                <li><a href="https://www.shadertoy.com">Shadertoy. Similar to this app, but more popular</a></li>
                <li><a href="http://glslsandbox.com">GLSL Sandbox. Similar to this app, but more popular</a></li>
              </ul>
            </div>
          </ContentWrapper>
        </MenuWrapper>
        }
      </div>
    )
  }
}

export default Menu
