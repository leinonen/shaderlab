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

const textureSource = `uniform sampler2D texture0;
vec3 color = texture2D(texture0, uv).rgb;`

const cubemapSource = `uniform samplerCube cubemap;
vec3 color = textureCube(cubemap, dir).rgb;`

const textures = [
  { url: '/textures/tunnel.jpg', thumb: '/textures/tunnel_thumb.jpg' },
  { url: '/textures/dots.jpg', thumb: '/textures/dots_thumb.jpg' },
  { url: '/textures/flesh.jpg', thumb: '/textures/flesh_thumb.jpg' },
  { url: '/textures/spongebob.jpg', thumb: '/textures/spongebob_thumb.jpg' }
]

const cubeTextures = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'].map(name => ({
  url: `/textures/cubemap/${name}.jpg`,
  thumb: `/textures/cubemap/${name}.jpg`
}))

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  & > button {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    margin-right: 1rem;
    min-width: 3rem;
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
      showCubemaps: false,
    }
    this.toggleScaling = this.toggleScaling.bind(this)
    this.toggleTextures = this.toggleTextures.bind(this)
    this.toggleCubemaps = this.toggleCubemaps.bind(this)
    this.inputChange = this.inputChange.bind(this)
  }

  toggleScaling() {
    this.setState({ showScaling: !this.state.showScaling })
  }

  toggleTextures() {
    this.setState({ showTextures: !this.state.showTextures })
  }

  toggleCubemaps() {
    this.setState({ showCubemaps: !this.state.showCubemaps })
  }

  inputChange(e) {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  render() {
    const { app, config, scale1x, scale2x, scale4x, setTexture0 } = this.props
    const { scaling, texture0 } = config
    const { showScaling, showTextures, showCubemaps } = this.state

    return (
      <Menu expanded={app.showConfig}>
        <Group name="Scaling" expanded={showScaling} onExpandToggle={this.toggleScaling} >
          <p>Lower scaling will improve performance but reduce image quality</p>
          <TextureRow>
            <div className="shrink">
              <label>Scale Factor</label>
            </div>
            <div>
              <ButtonWrapper>
                <Button active={scaling === 1.0} onClick={scale1x}>1</Button>
                <Button active={scaling === 0.5} onClick={scale2x}>1/2</Button>
                <Button active={scaling === 0.25} onClick={scale4x}>1/4</Button>
              </ButtonWrapper>
            </div>
          </TextureRow>
        </Group>
        <Group name="Textures" expanded={showTextures} onExpandToggle={this.toggleTextures} >
          <Snippet name="Texture uniform" source={textureSource} />
          <TextureRow>
            <div className="shrink">
              <label>texture0</label>
            </div>
            <div>
              <TexturePicker textures={textures} currentTexture={texture0} onSelect={this.props.setTexture0} />
            </div>
          </TextureRow>
        </Group>
        <Group name="Cubemaps" expanded={showCubemaps} onExpandToggle={this.toggleCubemaps} >
          <Snippet name="Cubemap uniform" source={cubemapSource} />
          <TextureRow>
            <div className="shrink">
              <label>cubemap</label>
            </div>
            <div>
              <TexturePicker disabled textures={cubeTextures} />
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
