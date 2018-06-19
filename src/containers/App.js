import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux'
import { createSelector } from 'reselect'

import setupStore from '../store/index'

import ShaderCanvas from './ShaderCanvas'
import Editor from './Editor'
import StatusBar from './StatusBar'
import Navigation from './Navigation'
import Toolbox from './Toolbox'
import Config from './Config'

import { selectApp, selectEditor, selectConfig } from '../store/selectors'
import { collapseMenus, toggleEditor, setShaderSource, setEditorSource } from '../store/actions'

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
    window.removeEventListener('keydown', this.keydownListener)
    window.removeEventListener('resize', this.resizeHandler)
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
    const { app, editor, config } = this.props
    return (
      <div>
        <ShaderCanvas width={width * config.scaling} height={height * config.scaling}
        />
        <Navigation onFullscreen={this.onFullscreen} />
        <Editor
          onLoad={(editor) => { this.editor = editor; }}
          style={{ visibility: app.showEditor ? 'visible' : 'hidden' }}
          width={`${width}`}
          height={`${height}`}
        />
        <StatusBar />
        <Toolbox expanded={app.showToolbox} />
        <Config expanded={app.showConfig} />
      </div>
    )
  }
}

const mapStateToProps = createSelector(
  selectApp,
  selectEditor,
  selectConfig,
  (app, editor, config) => ({ app, editor, config })
)
const mapDispatchToProps = {
  setEditorSource,
  setShaderSource,
  collapseMenus,
  toggleEditor
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
