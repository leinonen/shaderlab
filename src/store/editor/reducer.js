import defaultShader from '../../examples/2D/kaleidoscope.frag'

import {
  SET_SHADER_SOURCE, 
  SET_EDITOR_SOURCE,
  COMPILE_SUCCESS, 
  COMPILE_ERROR,
  RESET,
  SELECT_EXAMPLE
} from '../actions'

const initialState = {
  compileSuccess: true,
  compileMessage: '',
  shaderSource: defaultShader,
  editorSource: defaultShader,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SHADER_SOURCE: {
      return { ...state, shaderSource: action.payload }
    }
    case SET_EDITOR_SOURCE: {
      return { ...state, editorSource: action.payload }
    }
    case COMPILE_SUCCESS: {
      return { ...state, compileSuccess: true, compileMessage: 'Compile Successful' }
    }
    case COMPILE_ERROR: {
      return { ...state, compileSuccess: false, compileMessage: action.payload }
    }
    case RESET: {
      return { ...state, shaderSource: defaultShader, editorSource: defaultShader }
    }
    case SELECT_EXAMPLE: {
      return { ...state, shaderSource: action.payload, editorSource: action.payload }
    }
    default:
      return state
  }
}

export default reducer
