import React from 'react'
import styled from 'styled-components'

const Wraps = styled.div`
  display: flex;
  flex-wrap: wrap;
  
  & > div {
    flex: 1 1 ${props => props.size};
    & > img {
      max-width: 100%;
      box-sizing: border-box;
      border: 2px solid transparent;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      cursor: ${props => props.disabled ? 'inherit' : 'pointer'};
      opacity: 0.5;
      &.active {
        border-color: rgba(200, 255, 0, 0.7);
        opacity: 1;
      }
    }
  }
`

function TexturePicker({ textures, currentTexture, onSelect, disabled, size }) {

  return (
    <Wraps disabled={disabled} size={size}>
      {
        textures.map((texture, idx) =>
          <div key={idx}>
            <img
              src={texture.thumb}
              onClick={(e) => { if (!disabled) { onSelect(texture.url) } }}
              className={currentTexture === texture.url ? 'active' : ''}
            />
          </div>
        )
      }
    </Wraps>
  )
}

TexturePicker.defaultProps = {
  disabled: false,
  size: '25%'
}

export default TexturePicker
