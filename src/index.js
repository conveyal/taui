import 'bootstrap/dist/css/bootstrap.css'
import 'react-select/dist/react-select.css'
import deepAssign from 'deep-assign'
import React from 'react'
import {render} from 'react-dom'

import {initialize as initializeBrowsochrones} from './browsochrones'
import Root from './containers/root'
import Site from './containers/indianapolis'
import configureStore from './store'

const initialStore = process.env.STORE

const fakeStore = configureStore()
const store = configureStore(deepAssign(fakeStore.getState(), initialStore))

initializeBrowsochrones(store, initialStore)

render(
  <Root store={store}><Site /></Root>,
  document.getElementById('root')
)

export default store
