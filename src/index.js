const vertexShaderSource = require('./shader.vert')
const cubeShader = require('./examples/raymarch_cube.frag')
const plasmaShader = require('./examples/plasma.frag')
const juliaShader = require('./examples/julia.frag')

let gl;
let time = 0.0;
let timeLocation;
let positionLocation;
let resolutionLocation;
let start = 0.0;
let fps = 0;
let fpstime = 0.0;
let canvas
let showEditor = true
let selectionEnd
let selectionStart

const examples = [
  {
    name: 'Raymarcher',
    source: cubeShader
  },
  {
    name: 'Plasma',
    source: plasmaShader
  },
  {
    name: 'Julia Fractal',
    source: juliaShader
  }
]

function H(type, attribs) {
  const el = document.createElement(type)
  Object.keys(attribs).forEach(attribKey => {
    el.setAttribute(attribKey, attribs[attribKey])
  })
  return el;
}

function getShader(gl, type, source) {
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
    errorMessage(msg)
    return null;
  }
  return shader;
}

function infoMessage(msg) {
  const info = document.querySelector('#info');
  info.innerText = msg
  info.classList.remove('error')
}

function errorMessage(msg) {
  const info = document.querySelector('#info');
  info.innerText = msg
  info.classList.add('error')
}

function compile() {
  const shaderSource = window.localStorage.getItem('shader') || cubeShader
  let vertexShader = getShader(gl, 'vertex', vertexShaderSource);
  let fragmentShader = getShader(gl, 'fragment', shaderSource);
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    errorMessage('Failed to initialize shader');
    gl.deleteProgram(program);
    return;
  }
  gl.useProgram(program);
  // Look up where the vertex data needs to go.
  positionLocation = gl.getAttribLocation(program, 'a_position');
  // Set the resolution
  resolutionLocation = gl.getUniformLocation(program, 'resolution');
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

  timeLocation = gl.getUniformLocation(program, 'time');
  gl.uniform1f(timeLocation, time);

  infoMessage('Shader compiled successfully. Press Ctrl + Enter to save, Ctrl + Space to toggle editor')
}

function toggleEditor() {
  showEditor = !showEditor
  const editor = document.querySelector('textarea')
  if (showEditor) {
    editor.classList.remove('hidden')
    editor.selectionEnd = selectionEnd
    editor.selectionStart = selectionStart
    editor.focus()
  } else {
    editor.classList.add('hidden')
    selectionEnd = editor.selectionEnd
    selectionStart = editor.selectionStart
  }
}

function toggleExplorer() {
  const browser = document.querySelector('#browser')
  if (browser.classList.contains('hidden')) {
    browser.classList.remove('hidden')
  } else {
    browser.classList.add('hidden')
  }
}

function createEditor() {

  let editor = H('textarea', {
    spellcheck: false,
    autocorrect: 'off',
    style: `
    position: absolute; 
    top: 0; 
    bottom: 0; 
    left: 0; 
    right: 0; 
    background-color: rgba(30,30,30,0.7); 
    border: 0; 
    width:100%; 
    box-sizing: border-box; 
    padding: 4em 1em 4em 12em; 
    color: rgba(255,255,255, 0.8);
    font-size: 1.2em;
    line-height: 1.5em;
    outline: none;
    `
  })
  document.body.appendChild(editor)
  editor.focus()
  editor.value = window.localStorage.getItem('shader') || cubeShader
  editor.scrollTop = 0
  editor.selectionStart = 0;
  editor.selectionEnd = 0;

  editor.addEventListener('keydown', function (e) {
    if (e.keyCode == 9 || e.which == 9) {
      e.preventDefault();
      let start = this.selectionStart
      this.value = this.value.substring(0, this.selectionStart) + "  " + this.value.substring(this.selectionEnd);
      this.selectionEnd = start + 2;
    }
    if (e.ctrlKey && e.code === 'Enter') {
      window.localStorage.setItem('shader', this.value)
      compile()
    }
  })

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
      toggleEditor()
    }
  })
}

function createInfoBox() {
  const infoBox = H('div', {
    id: 'info',
    style: `
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    z-index: 5;
    background-color: rgba(0,120,0, 1.0);
    color: white;
    right: 0;
    left: 0;
    padding: 0.5em;
    box-sizing: border-box;
    font-size: 0.8em;
    min-height: 2em;
    `
  })
  infoBox.innerText = 'Press Ctrl + Enter to recompile shader'
  document.body.appendChild(infoBox)
}

function createResetButton() {
  const button = document.createElement('button')
  button.setAttribute('style', `
    position: absolute;
    z-index: 5;
    top: 1rem;
    left: 1rem;
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    font-size: 1rem;
    font-weight: bold;
    background-color: rgba(30, 30, 30, 0.7);
    color: rgba(200, 255, 0, 0.7);
    border: 1px solid rgba(200, 255, 0, 0.7);
    cursor: pointer;
  `)
  button.setAttribute('title', 'Factory reset')
  button.innerHTML = '<span class="fa fa-trash-alt"></span>'
  button.addEventListener('click', () => {
    window.localStorage.setItem('shader', cubeShader)
    document.querySelector('textarea').value = cubeShader
    compile()
  })
  document.body.appendChild(button)
}

function createBrowserButton() {
  const button = document.createElement('button')
  button.setAttribute('style', `
    position: absolute;
    z-index: 5;
    top: 1rem;
    left: 4rem;
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    font-size: 1rem;
    font-weight: bold;
    background-color: rgba(30, 30, 30, 0.7);
    color: rgba(200, 255, 0, 0.7);
    border: 1px solid rgba(200, 255, 0, 0.7);
    cursor: pointer;
  `)
  button.setAttribute('title', 'Examples')
  button.innerHTML = '<span class="fa fa-list-alt"></span>'
  button.addEventListener('click', () => {
    toggleExplorer()
  })
  document.body.appendChild(button)
}

function createEditorButton() {
  const button = document.createElement('button')
  button.setAttribute('style', `
    position: absolute;
    z-index: 5;
    top: 1rem;
    left: 7rem;
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    font-size: 1rem;
    font-weight: bold;
    background-color: rgba(30, 30, 30, 0.7);
    color: rgba(200, 255, 0, 0.7);
    border: 1px solid rgba(200, 255, 0, 0.7);
    cursor: pointer;
  `)
  button.setAttribute('title', 'Toggle Editor (Ctrl + Space)')
  button.innerHTML = '<span class="fa fa-edit"></span>'
  button.addEventListener('click', () => {
    toggleEditor()
  })
  document.body.appendChild(button)
}

function createBrowser() {
  const browser = document.createElement('div')
  browser.classList.add('hidden')
  browser.setAttribute('id', 'browser')
  browser.setAttribute('style', `
  position: absolute;
  z-index: 3;
  width: 10em;
  top: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0,0,0, 0.7);
  color: white;
  box-sizing: border-box;
  padding: 1em;
  `)

  const h1 = document.createElement('h1')
  h1.setAttribute('style', `
  font-size: 1.5em;
  margin-top: 2em;
  `)
  h1.innerText = 'Examples'
  browser.appendChild(h1)

  const ul = document.createElement('ul')
  ul.setAttribute('style', `list-style-type: none; margin: 0; padding: 0;`)

  const createItem = (name, shader) => {
    const item = H('li', { style: `cursor: pointer; line-height: 1.5rem;` })
    item.innerText = name
    item.addEventListener('click', () => {
      toggleExplorer()
      window.localStorage.setItem('shader', shader)
      document.querySelector('textarea').value = shader;
      compile()
    })
    return item
  }
  examples.forEach(example => {
    ul.appendChild(createItem(example.name, example.source))
  })
  browser.appendChild(ul)

  document.body.appendChild(browser)
}

function main() {
  document.body.setAttribute('style', `
  padding:0;
  margin: 0;
  background-color: black;
  font-size: 100%;
  font-family: Courier;
  overflow-x: hidden;
  `);
  canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  })

  createEditor()
  createEditorButton()
  createInfoBox()
  createResetButton()
  createBrowserButton()
  createBrowser()

  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    errorMessage('OpenGL could not be initialized.')
    return;
  }

  compile()

  // Create a buffer and put a single clipspace rectangle in it (2 triangles).
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  start = Date.now();
  render();
}

window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
      return window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = (function () {
  return window.cancelCancelRequestAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.clearTimeout;
})();

function render() {
  let elapsedtime = (Date.now() - start) / 1000.0;
  let framespeed = 1.0;

  gl.viewport(0, 0, canvas.width, canvas.height)
  time += framespeed * elapsedtime;
  gl.uniform1f(timeLocation, time);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  fps++;
  fpstime += elapsedtime;

  if (fpstime >= 1.0) {
    fpstime -= 1.0;
    fps = 0;
  }

  start = Date.now();
  window.requestAnimationFrame(render, canvas);
}

window.onload = main
