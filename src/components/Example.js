import React from 'react'
import styled from 'styled-components'

import Button from './Button'

const ImageWrapper = styled.div`
  box-sizing: border-box;
  flex: 0 0 33%;
  padding: 0.5rem;
  & img {
    cursor: pointer;
    max-width: 100%;
  };
  & div {
    width: 100%;
    text-align: center;
    color: #777;
    line-height: 2rem;
  }
`

function Example({ name, thumbnail, source, onSelectExample }) {
  return (
    <ImageWrapper>
      <img src={`/assets/${thumbnail}`} onClick={() => { onSelectExample(source) }} />
      <div>{name}</div>
    </ImageWrapper>
  )
}


export default Example
