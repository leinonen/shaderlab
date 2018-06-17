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
    { url: '/textures/tunnel.jpg', thumb: '/textures/tunnel_thumb.jpg' },
    { url: '/textures/dots.jpg', thumb: '/textures/dots_thumb.jpg' },
    { url: '/textures/flesh.jpg', thumb: '/textures/flesh_thumb.jpg' },
    { url: '/textures/spongebob.jpg', thumb: '/textures/spongebob_thumb.jpg' }
  ]
  return (
    <Wraps>
      {
        textures.map((texture, idx) =>
          <div>
            <img
              key={idx}
              src={texture.thumb}
              onClick={(e) => onSelect(texture.url)}
              className={currentTexture === texture.url ? 'active' : ''}
            />
          </div>
        )
      }
    </Wraps>
  )
}

export default TexturePicker
