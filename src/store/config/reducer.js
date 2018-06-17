import {
  SCALE_1X, SCALE_2X, SCALE_4X,
  SET_TEXTURE0
} from '../actions'

import { getItem, setItem } from '../../utils/storage'

const initialState = {
  scaling: getItem('scaling') || 0.5,
  texture0: getItem('texture0') || '/textures/tunnel.jpg'
}



const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SCALE_1X: {
      setItem('scaling', 1.0)
      return { ...state, scaling: 1.0 }
    }
    case SCALE_2X: {
      setItem('scaling', 0.5)
      return { ...state, scaling: 0.5 }
    }
    case SCALE_4X: {
      setItem('scaling', 0.25)
      return { ...state, scaling: 0.25 }
    }
    case SET_TEXTURE0: {
      setItem('texture0', action.payload)
      return { ...state, texture0: action.payload }
    }
    default:
      return state
  }
}

export default reducer
