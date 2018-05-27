import React, { Component } from 'react'
import styled from 'styled-components'

import Button from './Button'

import exampleHippiePlasma from '../examples/fun_plasma.frag'
import exampleRaymarcher from '../examples/raymarch_cube.frag'
import exampleLattice from '../examples/lattice.frag'
import exampleFractal from '../examples/julia.frag'

import colorHsv2rgb from '../colors/hsv2rgb.glsl'

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

const GroupName = styled.h2`
  margin: 0.5rem 0;
  cursor: pointer;
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
            { name: 'Raymarched Lattice', source: exampleLattice, showSource: false }
          ]
        },
        {
          name: 'Color Functions',
          items: [
            { name: 'HSV 2 RGB', source: colorHsv2rgb, showSource: true}
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
