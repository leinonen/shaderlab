import React, { Component } from 'react'
import styled from 'styled-components'

import Button from './Button'
import Group from './Group'
import Example from './Example'
import Snippet from './Snippet'
import Link from './Link'

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
  background-color: ${props => props.expanded ? 'rgba(10,10,10,0.4)' : 'transparent'};
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
