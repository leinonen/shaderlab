import React from 'react'
import styled from 'styled-components'
import Button, { ButtonLink } from './Button'
import Icon from './Icon'

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 5;
  top: 0;
  right: 1rem;
  display: flex;
  justify-content: flex-end;
  @media screen and (max-width: 768px) {
    background: rgba(10, 10, 10, 0.9);
    left: 0;
    right: 0;
    padding-bottom: 1rem;
  }
  & > button {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    padding: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
  }
`

function Navigation({ onToggleToolbox, onEditorToggle, onSelectExample, onFullscreen, onReset, onToggleConfig }) {
  return (
    <ButtonWrapper>
      <Button title="Factory Reset" onClick={onReset}>
        <Icon name="trash-alt" />
      </Button>
      <Button title="Config" onClick={onToggleConfig}>
        <Icon name="cog" />
      </Button>
      <Button title="Toolbox" onClick={onToggleToolbox}>
        <Icon name="toolbox" />
      </Button>
      <Button title="Toggle Editor (Ctrl + Space)" onClick={onEditorToggle}>
        <Icon name="edit" />
      </Button>
      <Button title="Fullscreen" onClick={onFullscreen}>
        <Icon name="expand-arrows-alt" />
      </Button>
    </ButtonWrapper>
  )
}

export default Navigation
