import React from 'react'
import styled from 'styled-components'

const Button = styled.button`
  background-color: rgba(30, 30, 30, 0.5);
  color: rgba(200, 255, 0, 0.7);
  border: 1px solid transparent;
  border-color: ${props => props.active ? 'rgba(200, 255, 0, 0.7)' : 'transparent'};
  border-radius: 4px;
  transition: border-color 0.25s ease;
  cursor: pointer;
  outline-color: rgba(200, 255, 0, 0.8);
  font-family: 'Play', sans-serif;
  font-size: 1rem;
  line-height: 2rem;
  font-weight: bold;

  &:hover {
    border: 1px solid rgba(200, 255, 0, 0.7);
  }
`
export default Button
