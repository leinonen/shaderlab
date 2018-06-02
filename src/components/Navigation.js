import React from 'react'
import styled from 'styled-components'
import Button from './Button'

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 5;
  top: 0;
  right: 1rem;
  display: flex;
  justify-content: flex-end;
  & > button {
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
      <Button title="Factory Reset" onClick={onReset}><span className="fa fa-trash-alt"></span></Button>
      <Button title="Toolbox" onClick={onToggleExpanded}><span className="fa fa-toolbox"></span></Button>
      <Button title="Toggle Editor (Ctrl + Space)" onClick={onEditorToggle}><span className="fa fa-edit"></span></Button>
      <Button title="Fullscreen" onClick={onFullscreen}><span className="fa fa-expand-arrows-alt"></span></Button>
    </ButtonWrapper>
  )
}

export default Navigation
