import {applyMiddleware, compose, createStore} from 'redux'
import effects from 'redux-effects'
import fetch from 'redux-effects-fetch'
import multi from 'redux-multi'
import promises from 'redux-promise'

import rafScheduler from '../utils/raf-scheduler'
import rootReducer from '../reducers'

const finalCreateStore = compose(
  applyMiddleware(multi, effects, fetch, promises, rafScheduler)
)(createStore)

export default function configureStore (initialState) {
  return finalCreateStore(rootReducer, initialState)
}
