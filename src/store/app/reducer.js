import {
  TOGGLE_EDITOR, TOGGLE_TOOLBOX, TOGGLE_CONFIG, COLLAPSE_MENUS,
} from '../actions'

const initialState = {
  showEditor: true,
  showToolbox: false,
  showConfig: false,
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
    default:
      return state
  }
}

export default reducer
