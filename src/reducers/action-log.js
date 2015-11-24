import {handleActions} from 'redux-actions'

const initialActionLog = [{
  createdAt: new Date(),
  index: 0,
  text: 'Welcome to our transit analysis tool! Find how your site stacks up compared to others in the region. Search for your address or drag the pin on the map.'
}]

const actionLogReducers = handleActions({
  ADD_ACTION_LOG_ITEM: (state, action) => {
    return [action.payload, ...state]
  }
}, initialActionLog)

export default actionLogReducers
