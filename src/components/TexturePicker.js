import React from 'react'
import styled from 'styled-components'

const Wraps = styled.div`
  display: flex;
  flex-wrap: wrap;
  & > div {
    flex: 1 1 16%;
    & > img {
      max-width: 100%;
      box-sizing: border-box;
      border: 2px solid transparent;
      border-radius: 4px;
      cursor: ${props => props.disabled ? 'inherit' : 'pointer'};
      &.active {
        border-color: rgba(200, 255, 0, 0.7);
      }
    }
  }
`

function TexturePicker({ textures, currentTexture, onSelect, disabled }) {

  return (
    <Wraps disabled={disabled}>
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
  disabled: false
}

export default TexturePicker
