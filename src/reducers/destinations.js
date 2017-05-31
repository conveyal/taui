// @flow
import {handleActions} from 'redux-actions'

import {ACCESSIBILITY_IS_EMPTY, ACCESSIBILITY_IS_LOADING} from '../constants'

export default handleActions(
  {
    'set accessibility for' (state, {payload}) {
      const accessibility = [...state]
      accessibility[payload.index] = {
        accessibility: payload.accessibility,
        name: payload.name
      }
      return accessibility
    },
    'set accessibility to empty for' (state, {payload}) {
      const accessibility = [...state]
      accessibility[payload.index] = {
        accessibility: ACCESSIBILITY_IS_EMPTY,
        name: payload.name
      }
      return accessibility
    },
    'set accessibility to loading for' (state, {payload}) {
      const accessibility = [...state]
      accessibility[payload.index] = {
        accessibility: ACCESSIBILITY_IS_LOADING,
        name: payload.name
      }
      return accessibility
    },
    'clear start' (state, action) {
      return state.map(a => ({
        accessibility: ACCESSIBILITY_IS_EMPTY,
        name: a.name
      }))
    }
  },
  []
)
