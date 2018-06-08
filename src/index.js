import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import setupStore from './store/index'
import App from './containers/App'

const store = setupStore()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
  , document.querySelector('#app'))
