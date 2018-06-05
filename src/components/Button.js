import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'

const Button = styled.button`
  background-color: rgba(30, 30, 30, 0.5);
  color: rgba(200, 255, 0, 0.7);
  border: 1px solid transparent;
  cursor: pointer;
  transition: border-color 0.25s ease;
  outline-color: rgba(200, 255, 0, 0.8);
  border-radius: 4px;
  font-size: 1rem;
  line-height: 2rem;
  font-weight: bold;

  &:hover {
    border: 1px solid rgba(200, 255, 0, 0.7);
  }
`
export default Button

export const ButtonLink = styled(Link)`
  display: inline-block;
  background-color: rgba(30, 30, 30, 0.5);
  color: rgba(200, 255, 0, 0.7);
  border: 1px solid transparent;
  cursor: pointer;
  transition: border-color 0.25s ease;
  outline-color: rgba(200, 255, 0, 0.8);
  border-radius: 4px;
  font-size: 1rem;
  line-height: 2rem;
  font-weight: bold;

  &:hover {
    border: 1px solid rgba(200, 255, 0, 0.7);
  }
`
