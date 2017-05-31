// @flow
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'hide map marker' (state, {payload}) {
      return {
        ...state,
        [payload.id]: null
      }
    },
    'show map marker' (state, {payload}) {
      return {
        ...state,
        [payload.id]: payload
      }
    },
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
    'clear end' (state) {
      return {
        ...state,
        end: null
      }
    },
    'clear start' (state) {
      return {
        ...state,
        start: null
      }
    }
  },
  {
    start: {},
    end: {}
  }
)
