import React from 'react'
import styled from 'styled-components'

const Wraps = styled.div`
  display: flex;
  flex-wrap: wrap;
  & > div {
    flex: 1 1 25%;
    & > img {
      max-width: 100%;
      box-sizing: border-box;
      border: 2px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      &.active {
        border-color: rgba(200, 255, 0, 0.7);
      }
    }
  }
`

function TexturePicker({ currentTexture, onSelect }) {
  const textures = [
    '/textures/tunnel.jpg',
    '/textures/dots.jpg',
    '/textures/flesh.jpg',
    '/textures/spongebob.jpg'
  ]
  return (
    <Wraps>
      {
        textures.map((texture, idx) =>
          <div>
            <img
              key={idx}
              src={texture}
              onClick={(e) => onSelect(texture)}
              className={currentTexture === texture ? 'active' : ''}
            />
          </div>
        )
      }
    </Wraps>
  )
}

export default TexturePicker
