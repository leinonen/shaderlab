import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux'

import setupStore from './store'

import ShaderCanvas from './components/ShaderCanvas'
import Editor from './components/Editor'
import StatusBar from './components/StatusBar'
import Navigation from './components/Navigation'
import Toolbox from './components/Toolbox'
import Config from './components/Config'

import {
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
} from './actions'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    this.onFullscreen = this.onFullscreen.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showEditor && this.props.showEditor !== nextProps.showEditor) {
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
        this.props.setShaderSource(this.props.editorSource)
      }
    })
  }

  componentWillUnmount() {
    window.removeEventListener(this.keydownListener)
    window.removeEventListener(this.resizeHandler)
  }

  onFullscreen() {
    let el = document.documentElement
    let rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen
    rfs.call(el)
  }

  render() {
    const { width, height } = this.state
    const isError = this.props.compileSuccess === false
    return (
      <div>
        <ShaderCanvas
          width={width * this.props.scaling}
          height={height * this.props.scaling}
          shader={this.props.shaderSource}
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
          style={{ visibility: this.props.showEditor ? 'visible' : 'hidden' }}
          value={this.props.editorSource}
          onChange={this.props.setEditorSource}
          width={`${width}`}
          height={`${height}`}
          focus={true}
        />
        <StatusBar error={isError}>{this.props.compileMessage}</StatusBar>
        <Toolbox
          expanded={this.props.showToolbox}
          onSelectExample={this.props.selectExample}
        />
        <Config
          expanded={this.props.showConfig}
          scaling={this.props.scaling}
          scale1x={this.props.scale1x}
          scale2x={this.props.scale2x}
          scale4x={this.props.scale4x}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state
  }
}

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
