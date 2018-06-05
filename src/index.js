import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import { Provider, connect } from 'react-redux'

import setupStore from './store'

import {
  compileSuccess,
  compileError,
  toggleEditor,
  setShaderSource,
  setEditorSource,
  reset,
  selectExample
} from './actions'

import ShaderCanvas from './components/ShaderCanvas'
import Editor from './components/Editor'
import Menu from './components/Menu'
import StatusBar from './components/StatusBar'

import fragmentShaderSource from './examples/2D/fun_plasma.frag'

const ScaleFactor = 0.5

const store = setupStore()

class App extends Component {

  constructor(props) {
    super(props)
    //    let currentShader = window.localStorage.getItem('shader') || fragmentShaderSource
    this.state = {
      //      shaderSource: currentShader,
      // editorText: props.editorSource,
      //      showEditor: true,
      //      compileSucces: true,
      //      compileMessage: '',
      menuExpanded: false,
      width: window.innerWidth,
      height: window.innerHeight
    }

    // this.toggleEditor = this.toggleEditor.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.updateEditorText = this.updateEditorText.bind(this)
    this.updateShaderSource = this.updateShaderSource.bind(this)
    this.onSelectExample = this.onSelectExample.bind(this)
//    this.onCompileError = this.onCompileError.bind(this)
//    this.onCompileSuccess = this.onCompileSuccess.bind(this)
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
        this.props.toggleEditor()
      }
      if (e.ctrlKey && e.code === 'Enter') {
        this.updateShaderSource(this.props.editorSource)
      }
    })
  }

  componentWillUnmount() {
    window.removeEventListener(this.keydownListener)
    window.removeEventListener(this.resizeHandler)
  }

  updateShaderSource(value) {
    // this.setState({ shaderSource: value })
    this.props.setShaderSource(value)
  }

  updateEditorText(value) {
    this.props.setEditorSource(value)
    // this.setState({ editorText: value })
  }
/*
  toggleEditor() {
    / *
    this.setState((prevState, props) => {
      if (prevState.showEditor === false) {
        this.editor.focus()
      }
      return {
        showEditor: !prevState.showEditor
      }
    })* /
    this.props.toggleEditor()
  }
*/
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

  render() {
    const isError = this.props.compileSucces === false
    return (
      <BrowserRouter>
        <div>
          <ShaderCanvas
            width={this.state.width * ScaleFactor}
            height={this.state.height * ScaleFactor}
            shader={this.props.shaderSource}
            onCompileSuccess={this.props.compileSuccess}
            onCompileError={this.props.compileError}
          />
          <Menu
            expanded={this.state.menuExpanded}
            onToggleExpanded={this.toggleMenu}
            onEditorToggle={this.props.toggleEditor}
            onSelectExample={this.props.selectExample}
            onFullscreen={this.onFullscreen}
            onReset={this.props.reset}
          />
          <Editor
            onLoad={(editor) => { this.editor = editor; }}
            style={{ visibility: this.props.showEditor ? 'visible' : 'hidden' }}
            value={this.props.editorSource}
            onChange={this.props.setEditorSource}
            width={`${this.state.width}`}
            height={`${this.state.height}`}
            focus={true}
          />
          <StatusBar error={isError}>{this.state.compileMessage}</StatusBar>
        </div>
      </BrowserRouter>
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
  setShaderSource,
  setEditorSource,
  reset,
  selectExample
}

const ShaderLab = connect(mapStateToProps, mapDispatchToProps)(App)

ReactDOM.render(
  <Provider store={store}>
    <ShaderLab />
  </Provider>
  , document.querySelector('#app'))
