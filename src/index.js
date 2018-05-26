import React, { Component } from 'react'
import ReactDOM from 'react-dom';

import ShaderCanvas from './components/ShaderCanvas'
import Editor from './components/Editor'
import Menu from './components/Menu'
import StatusBar from './components/StatusBar'

import fragmentShaderSource from './examples/fun_plasma.frag'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      shaderSource: fragmentShaderSource,
      editorText: fragmentShaderSource,
      showEditor: true,
      compileSucces: true,
      compileMessage: '',
      menuExpanded: false,
      width: window.innerWidth,
      height: window.innerHeight
    }
    this.toggleEditor = this.toggleEditor.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.updateEditorText = this.updateEditorText.bind(this)
    this.updateShaderSource = this.updateShaderSource.bind(this)
    this.onSelectExample = this.onSelectExample.bind(this)
    this.onCompileError = this.onCompileError.bind(this)
    this.onCompileSuccess = this.onCompileSuccess.bind(this)
    this.onFullscreen = this.onFullscreen.bind(this)
  }

  componentDidMount() {
    this.resizeHandler = window.addEventListener('resize', () => {
      this.setState({ width: window.innerWidth, height: window.innerHeight })
    })
    this.keydownListener = window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.setState({ menuExpanded: false })
      }
      if (e.ctrlKey && e.code === 'Space') {
        this.toggleEditor()
      }
      if (e.ctrlKey && e.code === 'Enter') {
        this.updateShaderSource(this.state.editorText)
      }
    })
  }

  componentWillUnmount() {
    window.removeEventListener(this.keydownListener)
    window.removeEventListener(this.resizeHandler)
  }

  updateShaderSource(value) {
    this.setState({ shaderSource: value })
  }

  updateEditorText(value) {
    this.setState({ editorText: value })
  }

  toggleEditor() {
    this.setState({ showEditor: !this.state.showEditor })
  }

  toggleMenu() {
    this.setState({ menuExpanded: !this.state.menuExpanded })
  }

  onFullscreen() {
    let el = document.documentElement
    let rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen

    rfs.call(el)
  }

  onSelectExample(source) {
    this.updateEditorText(source)
    this.updateShaderSource(source)
    this.setState({ menuExpanded: !this.state.menuExpanded })
  }

  onCompileError(msg) {
    this.setState({ compileSucces: false, compileMessage: msg })
  }

  onCompileSuccess() {
    this.setState({ compileSucces: true, compileMessage: 'Compile successful. Press Ctrl + Enter to compile shader, Ctrl + Space to toggle editor.' })
  }

  render() {
    const isError = this.state.compileSucces === false
    return (
      <div>
        <ShaderCanvas
          width={this.state.width}
          height={this.state.height}
          shader={this.state.shaderSource}
          onCompileSuccess={this.onCompileSuccess}
          onCompileError={this.onCompileError}
        />
        <Menu
          expanded={this.state.menuExpanded}
          onToggleExpanded={this.toggleMenu}
          onEditorToggle={this.toggleEditor}
          onSelectExample={this.onSelectExample}
          onFullscreen={this.onFullscreen}
        />
        <Editor
          style={{ visibility: this.state.showEditor ? 'visible' : 'hidden' }}
          value={this.state.editorText}
          onChange={this.updateEditorText}
          width={`${this.state.width}`}
          height={`${this.state.height}`}
          focus={true}
        />
        <StatusBar error={isError}>{this.state.compileMessage}</StatusBar>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
