import React from 'react'
import styled from 'styled-components'

import Button from './Button'

const ImageWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 2rem;
  & img {
    display: block;
    margin: 0 auto;
    cursor: pointer;
  };
  & button {
    width: 50%;
    margin: 0 auto;
    display: block;
    margin-top: -3rem;
  }
`

function Example({ name, thumbnail, source, onSelectExample }) {
  return (
    <ImageWrapper>
      <img src={`/assets/${thumbnail}`} onClick={() => { onSelectExample(source) }} />
      <Button onClick={() => { onSelectExample(source) }}>{name}</Button>
    </ImageWrapper>
  )
}

export default Example
