import React, { Component } from 'react'
import styled from 'styled-components'

import Menu from './Menu'
import Button from './Button'
import Group from './Group'

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  & > button {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    margin-right: 1rem;
    margin-top: 1rem;
  }
`

class Config extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showScaling: false
    }
    this.toggleScaling = this.toggleScaling.bind(this)
  }

  toggleScaling() {
    this.setState({ showScaling: !this.state.showScaling })
  }

  render() {
    const { expanded, scaling, scale1x, scale2x, scale4x } = this.props
    const { showScaling } = this.state
    return (
      <Menu expanded={expanded}>
        <Group name="Scaling" expanded={showScaling} onExpandToggle={this.toggleScaling} >
          <ButtonWrapper>
            <Button active={scaling === 1.0} onClick={scale1x}>1/1</Button>
            <Button active={scaling === 0.5} onClick={scale2x}>1/2</Button>
            <Button active={scaling === 0.25} onClick={scale4x}>1/4</Button>
          </ButtonWrapper>
          <p>Lower scaling will improve performance but reduce image quality</p>
        </Group>
      </Menu>
    );
  }
}

export default Config;
