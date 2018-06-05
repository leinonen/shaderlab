import {
  SCALE_1X, SCALE_2X, SCALE_4X
} from './actions'

const initialState = {
  scaling: 0.5
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
    default:
      return state
  }
}

export default reducer
