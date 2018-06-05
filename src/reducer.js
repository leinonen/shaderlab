import fragmentShaderSource from './examples/2D/fun_plasma.frag'

import {
  TOGGLE_EDITOR,
  TOGGLE_TOOLBOX,
  TOGGLE_CONFIG,
  SET_SHADER_SOURCE,
  SET_EDITOR_SOURCE,
  COMPILE_SUCCESS,
  COMPILE_ERROR,
  RESET,
  SELECT_EXAMPLE
} from './actions'

const initialState = {
  compileSuccess: true,
  compileMessage: '',
  shaderSource: /* window.localStorage.getItem('shader') || */ fragmentShaderSource,
  editorSource: /* window.localStorage.getItem('shader') || */ fragmentShaderSource,
  showEditor: true,
  showToolbox: false,
  showConfig: false,
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case TOGGLE_EDITOR: {
      return {
        ...state,
        showEditor: !state.showEditor
      }
    }
    case TOGGLE_TOOLBOX: {
      return {
        ...state,
        showToolbox: !state.showToolbox
      }
    }
    case TOGGLE_CONFIG: {
      return {
        ...state,
        showConfig: !state.showConfig
      }
    }
    case SET_SHADER_SOURCE: {
      // window.localStorage.setItem('shader', action.payload)
      return {
        ...state,
        shaderSource: action.payload
      }
    }
    case SET_EDITOR_SOURCE: {
      return {
        ...state,
        editorSource: action.payload
      }
    }
    case COMPILE_SUCCESS: {
      return {
        ...state,
        compileSuccess: true,
        compileMessage: action.payload
      }
    }
    case COMPILE_ERROR: {
      return {
        ...state,
        compileSuccess: false,
        compileMessage: action.payload
      }
    }
    case RESET: {
      return {
        ...state,
        shaderSource: fragmentShaderSource,
        editorSource: fragmentShaderSource
      }
    }
    case SELECT_EXAMPLE: {
      return {
        ...state,
        shaderSource: action.payload,
        editorSource: action.payload
      }
    }
    default:
    return state
  }
}

export default reducer
