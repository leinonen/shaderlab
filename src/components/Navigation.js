import React from 'react'
import styled from 'styled-components'
import Button, { ButtonLink } from './Button'
import Icon from './Icon'
import { BrowserRouter, Route, Link as RouterLink } from 'react-router-dom'

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 5;
  top: 0;
  right: 1rem;
  display: flex;
  justify-content: flex-end;
  & > button,
  & > a {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    padding: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
  }
`

function Navigation({ onToggleExpanded, onEditorToggle, onSelectExample, onFullscreen, onReset }) {
  return (
    <ButtonWrapper>
      <Button title="Factory Reset" onClick={onReset}>
        <Icon name="trash-alt" />
      </Button>
      <Button title="Toolbox" onClick={onToggleExpanded}>
        <Icon name="toolbox" />
      </Button>
      <ButtonLink to="/toolbox">
        <Icon name="toolbox" />
      </ButtonLink>
      <ButtonLink to="/config">
        <Icon name="cog" />
      </ButtonLink>
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
