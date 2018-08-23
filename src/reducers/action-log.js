// @flow
import message from '@conveyal/woonerf/message'
import {handleActions} from 'redux-actions'

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
      text: message('Strings.Welcome')
    }
  ]
)
