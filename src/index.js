import 'babel-polyfill'
import deepAssign from 'deep-assign'
import React from 'react'
import {render} from 'react-dom'

import Root from './containers/root'
import Site from './containers/indianapolis'
import configureStore from './store'

const fakeStore = configureStore()
const store = configureStore(deepAssign(fakeStore.getState(), window.taui.config))

render(
  <Root store={store}><Site /></Root>,
  document.getElementById('root')
)

export default store
