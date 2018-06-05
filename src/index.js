import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux'

import setupStore from './store/index'

import ShaderCanvas from './components/ShaderCanvas'
import Editor from './components/Editor'
import StatusBar from './components/StatusBar'
import Navigation from './components/Navigation'
import Toolbox from './components/Toolbox'
import Config from './components/Config'

import { toggleEditor, toggleConfig, toggleToolbox, collapseMenus } from './store/app/actions'
import { compileSuccess, compileError, setShaderSource, setEditorSource, reset, selectExample } from './store/editor/actions'
import { scale1x, scale2x, scale4x } from './store/config/actions'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      fullscreen: false
    }
    this.onFullscreen = this.onFullscreen.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.app.showEditor && this.props.app.showEditor !== nextProps.app.showEditor) {
      this.editor.focus()
    }
  }

  componentDidMount() {
    this.resizeHandler = window.addEventListener('resize', () => {
      this.setState({ width: window.innerWidth, height: window.innerHeight })
    })
    this.keydownListener = window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.props.collapseMenus()
      }
      if (e.ctrlKey && e.code === 'Space') {
        this.props.toggleEditor()
      }
      if (e.ctrlKey && e.code === 'Enter') {
        this.props.setShaderSource(this.props.editor.editorSource)
      }
    })
  }

  componentWillUnmount() {
    window.removeEventListener(this.keydownListener)
    window.removeEventListener(this.resizeHandler)
  }

  onFullscreen() {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      if (this.state.fullscreen) {
        let el = document.documentElement
        let rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen
        rfs.call(el)
      } else {
        let cfs = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msCancelFullscreen;
        cfs.call(document)
      }
    })
  }

  render() {
    const { width, height } = this.state
    const {app, editor, config} = this.props
    const isError = editor.compileSuccess === false
    return (
      <div>
        <ShaderCanvas
          width={width * config.scaling}
          height={height * config.scaling}
          shader={editor.shaderSource}
          onCompileSuccess={this.props.compileSuccess}
          onCompileError={this.props.compileError}
        />
        <Navigation
          onEditorToggle={this.props.toggleEditor}
          onToggleConfig={this.props.toggleConfig}
          onToggleToolbox={this.props.toggleToolbox}
          onFullscreen={this.onFullscreen}
          onReset={this.props.reset}
        />
        <Editor
          onLoad={(editor) => { this.editor = editor; }}
          style={{ visibility: app.showEditor ? 'visible' : 'hidden' }}
          value={editor.editorSource}
          onChange={this.props.setEditorSource}
          width={`${width}`}
          height={`${height}`}
          focus={true}
        />
        <StatusBar error={isError}>{editor.compileMessage}</StatusBar>
        <Toolbox
          expanded={app.showToolbox}
          onSelectExample={this.props.selectExample}
        />
        <Config
          expanded={app.showConfig}
          scaling={config.scaling}
          scale1x={this.props.scale1x}
          scale2x={this.props.scale2x}
          scale4x={this.props.scale4x}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => state
const mapDispatchToProps = {
  compileSuccess,
  compileError,
  toggleEditor,
  toggleConfig,
  toggleToolbox,
  collapseMenus,
  setShaderSource,
  setEditorSource,
  reset,
  selectExample,
  scale1x,
  scale2x,
  scale4x
}

const ShaderLab = connect(mapStateToProps, mapDispatchToProps)(App)

const store = setupStore()

ReactDOM.render(
  <Provider store={store}>
    <ShaderLab />
  </Provider>
  , document.querySelector('#app'))
