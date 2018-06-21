import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { selectEditor, selectConfig } from '../store/selectors'

import { compileSuccess, compileError } from '../store/actions'

import vertexShaderSource from '../shader.vert'

class ShaderCanvas extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { editor, config } = this.props
    this.gl = ReactDOM.findDOMNode(this).getContext('webgl');
    this.canvas = ReactDOM.findDOMNode(this)
    this.canvas.width = this.props.width
    this.canvas.height = this.props.height
    this.time = 0;
    this.fps = 0
    this.fpstime = 0
    this.success = false
    this.textures = {}
    this.compile(editor.shaderSource)
    if (this.success) {
      this.applyTexture(0, config.texture0)
      this.applyTexture(1, config.texture1)
      this.applyTexture(2, config.texture2)
      this.applyTexture(3, config.texture3)
      this.loadCubeMaps()
    }
    this.paint()
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editor.shaderSource !== nextProps.editor.shaderSource) {
      this.compile(nextProps.editor.shaderSource)
    }
    if (this.props.width !== nextProps.width || this.props.height !== nextProps.height) {
      this.canvas.width = nextProps.width
      this.canvas.height = nextProps.height
    }
    if (this.props.config.texture0 !== nextProps.config.texture0) {
      this.applyTexture(0, nextProps.config.texture0)
    }
    if (this.props.config.texture1 !== nextProps.config.texture1) {
      this.applyTexture(1, nextProps.config.texture1)
    }
    if (this.props.config.texture2 !== nextProps.config.texture2) {
      this.applyTexture(2, nextProps.config.texture2)
    }
    if (this.props.config.texture3 !== nextProps.config.texture3) {
      this.applyTexture(3, nextProps.config.texture3)
    }
  }

  componentDidUpdate() {
    this.paint();
  }

  componentDidCatch(e) {
    console.log(e)
  }

  applyTexture(unit = 0, textureUrl) {
    let gl = this.gl
    const name = `texture${unit}`
    this.textures[unit] = this.loadTexture(textureUrl, true)
    this.bindTexture(unit)
  }

  bindTexture(unit) {
    let gl = this.gl
    const name = `texture${unit}`
    gl.uniform1i(gl.getUniformLocation(this.program, name), unit)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[unit])
  }

  getVertexShader(source) {
    return this.getShader('vertex', source)
  }

  getFragmentShader(source) {
    return this.getShader('fragment', source)
  }

  getShader(type, source) {
    let gl = this.gl
    let shader;
    if (type == 'fragment') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == 'vertex') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let msg = gl.getShaderInfoLog(shader).split('\n')[0]
      this.props.compileError(msg);
      return null;
    }
    return shader;
  }

  compile(fragSource) {
    try {
      let gl = this.gl
      let vertexShader = this.getVertexShader(vertexShaderSource);
      let fragmentShader = this.getFragmentShader(fragSource);
      let program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        this.props.compileError('Failed to initialize shader');
        console.log('failed to initialize shader');
        gl.deleteProgram(program);
        return;
      }

      this.props.compileSuccess(fragSource);

      gl.useProgram(program);

      this.positionLocation = gl.getAttribLocation(program, 'a_position');
      this.resolutionLocation = gl.getUniformLocation(program, 'resolution');
      gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
      this.timeLocation = gl.getUniformLocation(program, 'time');
      gl.uniform1f(this.timeLocation, this.time);

      let buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0
      ]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.positionLocation);
      gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.enable(gl.SAMPLE_COVERAGE);
      gl.sampleCoverage(0.5, false);

      this.program = program
    } catch (e) {
      console.log('failed to compile shader')
      this.success = false
      return
    }
    console.log('compile successful')
    this.start = Date.now();
    this.success = true
  }

  loadTexture(url, repeat = false) {
    let gl = this.gl
    try {
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

      const image = new Image()
      image.crossOrigin = 'Anonymous';
      image.src = url
      image.onerror = (e) => {
        console.log(e)
        this.props.compileError('Error loading texture')
      }
      image.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

        let ext = (
          gl.getExtension('EXT_texture_filter_anisotropic') ||
          gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
          gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
        )
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      })

      return texture
    } catch (e) {
      return null;
    }
  }

  loadCubeMaps() {
    /*
    right
    left
    top
    bottom
    front
    back
    */
    let urls = [
      '/textures/cubemap/posx.jpg',
      '/textures/cubemap/negx.jpg',
      '/textures/cubemap/posy.jpg',
      '/textures/cubemap/negy.jpg',
      '/textures/cubemap/posz.jpg',
      '/textures/cubemap/negz.jpg'
    ]
    
    let gl = this.gl
    const cubemapTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    for(let i=0; i<6; i++) {     
      const image = new Image()
      image.crossOrigin = 'Anonymous';
      image.src = urls[i]
      image.onerror = (e) => {
        console.log(e)
        this.props.compileError('Error loading cubemap texture #' + i)
      }
      image.addEventListener('load', () => {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      })
    }
    let cubemapLoc = gl.getUniformLocation(this.program, 'cubemap')
    gl.uniform1i(cubemapLoc, 0)
  }

  paint() {
    if (this.success) {
      let elapsedtime = (Date.now() - this.start) / 1000.0;
      let framespeed = 1.0;
      const gl = this.gl
      const canvas = this.canvas
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(this.resolutionLocation, canvas.width, canvas.height);

      this.bindTexture(0)
      this.bindTexture(1)
      this.bindTexture(2)
      this.bindTexture(3)

      this.time += framespeed * elapsedtime;
      gl.uniform1f(this.timeLocation, this.time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      this.fps++;
      this.fpstime += elapsedtime;
      
      if (this.fpstime >= 1.0) {
        this.fpstime -= 1.0;
        this.fps = 0;
      }
      
    }
    this.start = Date.now();
    requestAnimationFrame(() => {
      this.paint()
    })
  }

  render() {
    return <canvas></canvas>
  }
}

const mapStateToProps = createSelector(
  selectEditor,
  selectConfig,
  (editor, config) => ({ editor, config })
)

const mapDispatchToProps = {
  compileSuccess,
  compileError
}

export default connect(mapStateToProps, mapDispatchToProps)(ShaderCanvas)
