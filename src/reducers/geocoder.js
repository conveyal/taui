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
    },
    'set geocoder' (state, {payload}) {
      return {
        ...state,
        ...payload
      }
    }
  },
  {
    start: null,
    end: null
  }
)
