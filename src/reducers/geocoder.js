// @flow
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'set start' (state, {payload}) {
      return {
        ...state,
        start: payload
      }
    },
    'set end' (state, {payload}) {
      return {
        ...state,
        end: payload
      }
    }
  },
  {
    start: null,
    end: null
  }
)
