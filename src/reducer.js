import defaultShader from './examples/2D/fun_plasma.frag'

import {
  TOGGLE_EDITOR, TOGGLE_TOOLBOX, TOGGLE_CONFIG, COLLAPSE_MENUS,
  SET_SHADER_SOURCE, SET_EDITOR_SOURCE,
  COMPILE_SUCCESS, COMPILE_ERROR,
  RESET,
  SELECT_EXAMPLE,
  SCALE_1X, SCALE_2X, SCALE_4X
} from './actions'

const getCurrentShader = () => window.localStorage.getItem('shader') || defaultShader
const saveShaderToLocalStorage = (shader) => window.localStorage.setItem('shader', shader)

const initialState = {
  compileSuccess: true,
  compileMessage: '',
  shaderSource: getCurrentShader(),
  editorSource: getCurrentShader(),
  showEditor: true,
  showToolbox: false,
  showConfig: false,
  scaling: 0.5
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_EDITOR: {
      return { ...state, showEditor: !state.showEditor }
    }
    case TOGGLE_TOOLBOX: {
      return { ...state, showToolbox: !state.showToolbox, showConfig: false }
    }
    case TOGGLE_CONFIG: {
      return { ...state, showConfig: !state.showConfig, showToolbox: false }
    }
    case COLLAPSE_MENUS: {
      return { ...state, showConfig: false, showToolbox: false }
    }
    case SET_SHADER_SOURCE: {
      return { ...state, shaderSource: action.payload }
    }
    case SET_EDITOR_SOURCE: {
      return { ...state, editorSource: action.payload }
    }
    case COMPILE_SUCCESS: {
      saveShaderToLocalStorage(action.payload)
      return { ...state, compileSuccess: true, compileMessage: 'Compile Successful' }
    }
    case COMPILE_ERROR: {
      return { ...state, compileSuccess: false, compileMessage: action.payload }
    }
    case RESET: {
      return { ...state, shaderSource: defaultShader, editorSource: defaultShader }
    }
    case SELECT_EXAMPLE: {
      return { ...state, shaderSource: action.payload, editorSource: action.payload, showToolbox: false }
    }
    case SCALE_1X: {
      return { ...state, scaling: 1.0 }
    }
    case SCALE_2X: {
      return { ...state, scaling: 0.5 }
    }
    case SCALE_4X: {
      return { ...state, scaling: 0.25 }
    }
    default:
      return state
  }
}

export default reducer
