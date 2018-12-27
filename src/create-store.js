import {middleware as fetch} from '@conveyal/woonerf/fetch'
import multi from '@conveyal/woonerf/store/multi'
import promise from '@conveyal/woonerf/store/promise'
import {applyMiddleware, combineReducers, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

const logger = createLogger({
  collapsed: true,
  duration: true
})

const middlewares = [
  fetch,
  multi,
  promise,
  thunkMiddleware,
  logger
]

export default function configureStore (rootReducer, initialState) {
  return createStore(
    combineReducers(rootReducer),
    initialState,
    applyMiddleware(...middlewares)
  )
}
