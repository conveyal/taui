import 'babel-core/polyfill'
import React from 'react'
import {render} from 'react-dom'

import Root from './containers/root'
import Site from './containers/indianapolis'
import configureStore from './store'

const store = configureStore()

render(
  <Root store={store}><Site /></Root>,
  document.getElementById('root')
)

export default store
