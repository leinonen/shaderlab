import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

import configReducer from './config/reducer'
import editorReducer from './editor/reducer'
import appReducer from './app/reducer'

import { loadState } from '../utils/storage'

const persistedState = loadState()

const setupStore = () => createStore(
  combineReducers({
    config: configReducer,
    editor: editorReducer,
    app: appReducer
  }),
  persistedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunk)
)

export default setupStore
