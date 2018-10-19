import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { selectApp } from '../store/selectors'
import actions from '../store/actions'

import Icon from '../components/Icon'
import Button, { ButtonLink } from '../components/Button'

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
      <Button title="Config" onClick={props.toggleConfig} active={app.showConfig}>
        <Icon name="cog" />
      </Button>
      <Button title="Toolbox" onClick={props.toggleToolbox} active={app.showToolbox}>
        <Icon name="toolbox" />
      </Button>
      <Button title="Toggle Editor (Ctrl + Space)" onClick={props.toggleEditor} active={app.showEditor}>
        <Icon name="edit" />
      </Button>
      <Button title="Fullscreen" onClick={props.onFullscreen} active={app.showFullscreen}>
        <Icon name="expand-arrows-alt" />
      </Button>
    </ButtonWrapper>
  )
}

const mapStateToProps = createSelector(
  selectApp,
  (app) => ({ app })
)

export default connect(mapStateToProps, actions)(Navigation)
