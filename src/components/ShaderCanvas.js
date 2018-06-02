import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import vertexShaderSource from '../shader.vert'
import fragmentShaderSource from '../examples/2D/fun_plasma.frag'

export default class ShaderCanvas extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.gl = (ReactDOM).findDOMNode(this).getContext('webgl');
    this.canvas = (ReactDOM).findDOMNode(this)
    this.canvas.width = this.props.width
    this.canvas.height = this.props.height
    this.time = 0;
    this.fps = 0
    this.fpstime = 0
    this.compile()
    this.paint()
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    window.removeEventListener(this.onReSize)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.shader !== nextProps.shader) {
      // console.log('nextprops.shader', nextProps.shader)
      this.compile(nextProps.shader)
    }
    if (this.props.width !== nextProps.width || this.props.height !== nextProps.height) {
      this.canvas.width = nextProps.width
      this.canvas.height = nextProps.height
    }
  }

  componentDidUpdate() {
    this.paint();
  }

  componentDidCatch(e) {
    console.log(e)
  }

  getShader(gl, type, source) {
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
      this.props.onCompileError(msg);
      return null;
    }
    return shader;
  }

  compile(source) {
    if (!source) {
      source = window.localStorage.getItem('shader') || fragmentShaderSource
    }

    let gl = this.gl
    try {
      let vertexShader = this.getShader(gl, 'vertex', vertexShaderSource);
      let fragmentShader = this.getShader(gl, 'fragment', source);
      let program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        this.props.onCompileError('Failed to initialize shader');
        console.log('Failed to initialize shader');
        gl.deleteProgram(program);
        return;
      }

      this.props.onCompileSuccess();

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
    } catch (e) {
      console.log('fiasko')
    }
    this.start = Date.now();
  }

  paint() {
    let elapsedtime = (Date.now() - this.start) / 1000.0;
    let framespeed = 1.0;
    const gl = this.gl
    const canvas = this.canvas
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);

    this.time += framespeed * elapsedtime;
    gl.uniform1f(this.timeLocation, this.time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.fps++;
    this.fpstime += elapsedtime;

    if (this.fpstime >= 1.0) {
      this.fpstime -= 1.0;
      this.fps = 0;
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
