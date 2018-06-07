import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { selectApp } from '../store/selectors'
import { toggleConfig, toggleEditor, toggleToolbox } from '../store/app/actions'
import { reset } from '../store/editor/actions'

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

function Navigation(props) {
  const { app } = props
  return (
    <ButtonWrapper>
      <Button title="Factory Reset" onClick={props.reset}>
        <Icon name="trash-alt" />
      </Button>
      <Button title="Config" onClick={props.toggleConfig}>
        <Icon name="cog" />
      </Button>
      <Button title="Toolbox" onClick={props.toggleToolbox}>
        <Icon name="toolbox" />
      </Button>
      <Button title="Toggle Editor (Ctrl + Space)" onClick={props.toggleEditor}>
        <Icon name="edit" />
      </Button>
      <Button title="Fullscreen" onClick={props.onFullscreen}>
        <Icon name="expand-arrows-alt" />
      </Button>
    </ButtonWrapper>
  )
}

const mapStateToProps = createSelector(
  selectApp,
  (app) => ({ app })
)

const mapDispatchToProps = {
  reset,
  toggleEditor,
  toggleConfig,
  toggleToolbox
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
