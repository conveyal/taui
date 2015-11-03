import {applyMiddleware, createStore} from 'redux'
import thunk from 'redux-thunk'

import reducers from './reducers'

const logger = store => next => action => {
  console.groupCollapsed(action.type)
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const store = applyMiddleware(logger, thunk)(createStore)(reducers)

export default store
