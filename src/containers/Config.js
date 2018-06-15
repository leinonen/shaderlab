import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import styled from 'styled-components'

import Menu from '../components/Menu'
import Button from '../components/Button'
import Group from '../components/Group'
import TexturePicker from '../components/TexturePicker'
import Snippet from '../components/Snippet'

import { selectApp, selectConfig } from '../store/selectors';
import { scale1x, scale2x, scale4x, setTexture0 } from '../store/actions'

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

const TextureRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  & > div {
    flex: 1 1 auto;
    line-height: 2rem;
    box-sizing: border-box;
    padding: 1rem;
  }
  & > .shrink {
    flex: 0 0 auto;
  }
`

const Input = styled.input`
  background-color: rgba(30, 30, 30, 0.5);
  color: white;
  border: 1px solid transparent;
  border-color: rgba(200, 255, 0, 0.7);
  border-radius: 4px;
  outline-color: rgba(200, 255, 0, 0.8);
  font-size: 1rem;
  line-height: 2rem;
  font-weight: bold;
  box-sizing: border-box;
  width: 100%;
`

class Config extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showScaling: false,
      showTextures: false,
      texture0: props.config.texture0
    }
    this.toggleScaling = this.toggleScaling.bind(this)
    this.toggleTextures = this.toggleTextures.bind(this)
    this.inputChange = this.inputChange.bind(this)
    this.applyTexture0 = this.applyTexture0.bind(this)
  }

  toggleScaling() {
    this.setState({ showScaling: !this.state.showScaling })
  }

  toggleTextures() {
    this.setState({ showTextures: !this.state.showTextures })
  }

  applyTexture0() {
    this.props.setTexture0(this.state.texture0)
  }

  inputChange(e) {
    const {name, value} = e.target
    this.setState({[name]: value})
  }

  render() {
    const { app, config, scale1x, scale2x, scale4x, setTexture0 } = this.props
    const { scaling, texture0 } = config
    const { showScaling, showTextures } = this.state
    const uniformSource = `uniform sampler2D texture0;
vec3 color = texture2D(texture0, uv).rgb;`

    return (
      <Menu expanded={app.showConfig}>
        <Group name="Scaling" expanded={showScaling} onExpandToggle={this.toggleScaling} >
          <ButtonWrapper>
            <Button active={scaling === 1.0} onClick={scale1x}>1/1</Button>
            <Button active={scaling === 0.5} onClick={scale2x}>1/2</Button>
            <Button active={scaling === 0.25} onClick={scale4x}>1/4</Button>
          </ButtonWrapper>
          <p>Lower scaling will improve performance but reduce image quality</p>
        </Group>
        <Group name="Textures" expanded={showTextures} onExpandToggle={this.toggleTextures} >
          <Snippet name="Texture uniform" source={uniformSource} />
          <TextureRow>
            <div className="shrink">
              <label>texture0</label>
            </div>
            <div>
              <TexturePicker currentTexture={texture0} onSelect={this.props.setTexture0} />
            </div>
          </TextureRow>
        </Group>
      </Menu>
    );
  }
}

const mapStateToProps = createSelector(
  selectApp,
  selectConfig,
  (app, config) => ({ app, config })
)

const mapDispatchToProps = {
  scale1x,
  scale2x,
  scale4x,
  setTexture0
}

export default connect(mapStateToProps, mapDispatchToProps)(Config);
