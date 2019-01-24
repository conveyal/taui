import multi from '@conveyal/woonerf/store/multi'
import promise from '@conveyal/woonerf/store/promise'
import {applyMiddleware, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

const logger = createLogger({
  collapsed: true,
  duration: true
})

const middlewares = [
  multi,
  promise,
  thunkMiddleware
]

export default function configureStore (reducer, initialState, isServer) {
  if (!isServer) {
    middlewares.push(logger)
  }

  return createStore(reducer, initialState, applyMiddleware(...middlewares))
}
