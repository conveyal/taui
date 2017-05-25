import {handleActions} from 'redux-actions'
import messages from '../utils/messages'

export default handleActions(
  {
    'add action log item' (state, action) {
      return [action.payload, ...state]
    }
  },
  [
    {
      createdAt: new Date(),
      index: 0,
      text: messages.Strings.Welcome
    }
  ]
)
