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
import actions from '../store/actions'

const textureSource = `uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
vec3 color = texture2D(texture0, uv).rgb;`

const cubemapSource = `uniform samplerCube cubemap;
vec3 color = textureCube(cubemap, dir).rgb;`

const textures = [
  { url: '/textures/tunnel.jpg', thumb: '/textures/tunnel_thumb.jpg' },
  { url: '/textures/dots.jpg', thumb: '/textures/dots_thumb.jpg' },
  { url: '/textures/flesh.jpg', thumb: '/textures/flesh_thumb.jpg' },
  { url: '/textures/tex2_512.jpg', thumb: '/textures/tex2_512_thumb.jpg' },
  { url: '/textures/tex6_512.jpg', thumb: '/textures/tex6_512_thumb.jpg' },
  { url: '/textures/tex17_512.jpg', thumb: '/textures/tex17_512_thumb.jpg' },
  { url: '/textures/tex1_512.jpg', thumb: '/textures/tex1_512_thumb.jpg' },
  { url: '/textures/tex6_256.jpg', thumb: '/textures/tex6_256_thumb.jpg' },
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
  background-color: rgba(0,0,0, 0.3);
  border: 1px solid rgba(0,0,0, 0.3);
  border-radius: 4px;
  margin-bottom: 1rem;

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
      scalingExpanded: false,
      editorExpanded: false,
      texturesExpanded: false,
      cubemapsExpanded: false,
    }
    this.toggleScaling = this.toggleScaling.bind(this)
    this.toggleTextures = this.toggleTextures.bind(this)
    this.toggleCubemaps = this.toggleCubemaps.bind(this)
    this.toggleEditor = this.toggleEditor.bind(this)
    this.inputChange = this.inputChange.bind(this)
  }

  toggleScaling() {
    this.setState({ scalingExpanded: !this.state.scalingExpanded })
  }

  toggleTextures() {
    this.setState({ texturesExpanded: !this.state.texturesExpanded })
  }

  toggleCubemaps() {
    this.setState({ cubemapsExpanded: !this.state.cubemapsExpanded })
  }

  toggleEditor() {
    this.setState({ editorExpanded: !this.state.editorExpanded })
  }

  inputChange(e) {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  render() {
    const {
      app, config,
      scale1x, scale2x, scale4x,
      setTexture0, setTexture1, setTexture2, setTexture3,
      setEditorAlpha
    } = this.props

    const {
      scaling, editorAlpha, texture0, texture1, texture2, texture3
    } = config

    const {
      scalingExpanded, editorExpanded, texturesExpanded, cubemapsExpanded
    } = this.state

    return (
      <Menu expanded={app.showConfig}>
        <Group name="Scaling" expanded={scalingExpanded} onExpandToggle={this.toggleScaling} >
          <p>Lower scaling will improve performance but reduce image quality.</p>
          <p>Useful when building complex shaders that your GPU can't handle :)</p>
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

        <Group name="Editor" expanded={editorExpanded} onExpandToggle={this.toggleEditor} >
          <p>Adjust the transparency of the editor background.</p>
          <TextureRow>
            <div className="shrink">
              <label>Background Alpha</label>
            </div>
            <div>
              <ButtonWrapper>
                <Button active={editorAlpha === 0.2} onClick={() => setEditorAlpha(0.2)}>20%</Button>
                <Button active={editorAlpha === 0.3} onClick={() => setEditorAlpha(0.3)}>30%</Button>
                <Button active={editorAlpha === 0.4} onClick={() => setEditorAlpha(0.4)}>40%</Button>
                <Button active={editorAlpha === 0.5} onClick={() => setEditorAlpha(0.5)}>50%</Button>
                <Button active={editorAlpha === 0.6} onClick={() => setEditorAlpha(0.6)}>60%</Button>
                <Button active={editorAlpha === 0.7} onClick={() => setEditorAlpha(0.7)}>70%</Button>
              </ButtonWrapper>
            </div>
          </TextureRow>
        </Group>

        <Group name="Textures" expanded={texturesExpanded} onExpandToggle={this.toggleTextures} >
          <Snippet name="Texture uniforms" source={textureSource} />
          <TextureRow>
            <div className="shrink">
              <label>texture0</label>
            </div>
            <div>
              <TexturePicker textures={textures} currentTexture={texture0} onSelect={this.props.setTexture0} />
            </div>
          </TextureRow>
          <TextureRow>
            <div className="shrink">
              <label>texture1</label>
            </div>
            <div>
              <TexturePicker textures={textures} currentTexture={texture1} onSelect={this.props.setTexture1} />
            </div>
          </TextureRow>
          <TextureRow>
            <div className="shrink">
              <label>texture2</label>
            </div>
            <div>
              <TexturePicker textures={textures} currentTexture={texture2} onSelect={this.props.setTexture2} />
            </div>
          </TextureRow>
          <TextureRow>
            <div className="shrink">
              <label>texture3</label>
            </div>
            <div>
              <TexturePicker textures={textures} currentTexture={texture3} onSelect={this.props.setTexture3} />
            </div>
          </TextureRow>
        </Group>

        <Group name="Cubemaps" expanded={cubemapsExpanded} onExpandToggle={this.toggleCubemaps} >
          <Snippet name="Cubemap uniform" source={cubemapSource} />
          <TextureRow>
            <div className="shrink">
              <label>cubemap</label>
            </div>
            <div>
              <TexturePicker disabled textures={cubeTextures} size="16%" />
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

export default connect(mapStateToProps, actions)(Config);
