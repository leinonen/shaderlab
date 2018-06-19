import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import throttle from 'lodash/throttle'

import setupStore from './store/index'
import App from './containers/App'
import { saveState } from './utils/storage'

const store = setupStore()

store.subscribe(throttle(() => {
  saveState(store.getState())
}))

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
  , document.querySelector('#app'))
