import moment from 'moment'
import {handleActions} from 'redux-actions'

const format = 'MM-DD HH:mm:ss'

const initialActionLog = [{
  createdAt: moment().format(format),
  index: 0,
  text: 'Welcome to our transit analysis tool! Find how your site stacks up compared to others in the region. Search for your address or drag the pin on the map.'
}]

const actionLogReducers = handleActions({
  ADD_ACTION_LOG_ITEM: (state, action) => {
    const payload = typeof action.payload === 'string'
      ? { text: action.payload }
      : action.payload

    const item = Object.assign({
      createdAt: moment().format(format),
      level: 'info'
    }, payload)
    return [item, ...state]
  }
}, initialActionLog)

export default actionLogReducers
