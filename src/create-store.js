import multi from '@conveyal/woonerf/store/multi'
import promise from '@conveyal/woonerf/store/promise'
import {applyMiddleware, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import reducer from './reducer'

const logger = createLogger({collapsed: true, duration: true})
const middlewares = [multi, promise, thunkMiddleware]

/**
 * Configure the Redux store with middleware, reducers, and a derived initial
 * state. Only add the logging middleware on the client side.
 */
export default function configureStore(initialState) {
  if (typeof window !== 'undefined') {
    middlewares.push(logger)
  }

  return createStore(reducer, initialState, applyMiddleware(...middlewares))
}
