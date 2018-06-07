import {
  SCALE_1X, SCALE_2X, SCALE_4X,
  SET_TEXTURE0
} from './actions'

const initialState = {
  scaling: 0.5,
  texture0: 'http://localhost:8080/textures/tunnel.jpg'
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
    default:
      return state
  }
}

export default reducer
