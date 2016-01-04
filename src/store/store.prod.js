import {applyMiddleware, compose, createStore} from 'redux'
import effects from 'redux-effects'
import fetch from 'redux-effects-fetch'
import multi from 'redux-multi'

import rootReducer from '../reducers'

const finalCreateStore = compose(
  applyMiddleware(multi, effects, fetch)
)(createStore)

export default function configureStore (initialState) {
  return finalCreateStore(rootReducer, initialState)
}
