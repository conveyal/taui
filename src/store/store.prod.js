import {applyMiddleware, compose, createStore} from 'redux'
import effects from 'redux-effects'
import fetch from 'redux-effects-fetch'

import rootReducer from '../reducers'

const finalCreateStore = compose(
  applyMiddleware(effects, fetch)
)(createStore)

export default function configureStore (initialState) {
  return finalCreateStore(rootReducer, initialState)
}
