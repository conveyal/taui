import {unstable_batchedUpdates as batchedUpdates} from 'react-dom'
import {applyMiddleware, compose, createStore} from 'redux'
import {batchedSubscribe} from 'redux-batched-subscribe'
import {persistState} from 'redux-devtools'
import effects from 'redux-effects'
import fetch from 'redux-effects-fetch'
import createLogger from 'redux-logger'
import multi from 'redux-multi'
import promises from 'redux-promise'

import DevTools from '../components/dev-tools'
import rafScheduler from '../utils/raf-scheduler'
import rootReducer from '../reducers'

const finalCreateStore = compose(
  applyMiddleware(multi, effects, fetch, promises, rafScheduler),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
  applyMiddleware(createLogger()),
  DevTools.instrument(),
  batchedSubscribe(batchedUpdates)
)(createStore)

export default function configureStore (initialState) {
  return finalCreateStore(rootReducer, initialState)
}
