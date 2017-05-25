import {handleActions} from 'redux-actions'

import {ACCESSIBILITY_IS_EMPTY, ACCESSIBILITY_IS_LOADING} from '../constants'

export default handleActions(
  {
    'set accessibility for' (state, {payload}) {
      const accessibility = [...state.accessibility]
      accessibility[payload.index] = {
        accessibility: payload.accessibility,
        name: payload.name
      }
      return {
        ...state,
        accessibility
      }
    },
    'set accessibility to empty for' (state, {payload}) {
      const accessibility = [...state.accessibility]
      accessibility[payload.index] = {
        accessibility: ACCESSIBILITY_IS_EMPTY,
        name: payload.name
      }
      return {
        ...state,
        accessibility
      }
    },
    'set accessibility to loading for' (state, {payload}) {
      const accessibility = [...state.accessibility]
      accessibility[payload.index] = {
        accessibility: ACCESSIBILITY_IS_LOADING,
        name: payload.name
      }
      return {
        ...state,
        accessibility
      }
    },
    'clear start' (state, action) {
      return {
        ...state,
        accessibility: state.accessibility.map(a => ({
          accessibility: ACCESSIBILITY_IS_EMPTY,
          name: a.name
        }))
      }
    }
  },
  {
    accessibility: []
  }
)
