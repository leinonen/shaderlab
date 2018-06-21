import {
  SCALE_1X, SCALE_2X, SCALE_4X,
  SET_TEXTURE0, SET_TEXTURE1, SET_TEXTURE2, SET_TEXTURE3
} from '../actions'

const initialState = {
  scaling: 0.5,
  texture0: '/textures/tunnel.jpg',
  texture1: '/textures/dots.jpg',
  texture2: '/textures/flesh.jpg',
  texture3: '/textures/tex1_512.jpg'
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SCALE_1X: {
      return { ...state, scaling: 1.0 }
    }
    case SCALE_2X: {
      return { ...state, scaling: 0.5 }
    }
    case SCALE_4X: {
      return { ...state, scaling: 0.25 }
    }
    case SET_TEXTURE0: {
      return { ...state, texture0: action.payload }
    }
    case SET_TEXTURE1: {
      return { ...state, texture1: action.payload }
    }
    case SET_TEXTURE2: {
      return { ...state, texture2: action.payload }
    }
    case SET_TEXTURE3: {
      return { ...state, texture3: action.payload }
    }
    default:
      return state
  }
}

export default reducer
