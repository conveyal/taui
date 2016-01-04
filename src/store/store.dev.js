import {applyMiddleware, compose, createStore} from 'redux'
import {persistState} from 'redux-devtools'
import effects from 'redux-effects'
import fetch from 'redux-effects-fetch'
import createLogger from 'redux-logger'
import multi from 'redux-multi'

import DevTools from '../components/dev-tools'
import rootReducer from '../reducers'

const finalCreateStore = compose(
  applyMiddleware(multi, effects, fetch),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
  applyMiddleware(createLogger()),
  DevTools.instrument()
)(createStore)

export default function configureStore (initialState) {
  const store = finalCreateStore(rootReducer, initialState)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers')
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
