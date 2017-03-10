import {handleActions} from 'redux-actions'

import {
  ACCESSIBILITY_IS_EMPTY,
  ACCESSIBILITY_IS_LOADING
} from '../constants'

export default handleActions({
  'set accessibility for' (state, {payload}) {
    const accessibility = [...state.accessibility]
    accessibility[payload.index] = payload.accessibility
    return {
      ...state,
      accessibility
    }
  },
  'set accessibility to empty for' (state, {payload}) {
    const accessibility = [...state.accessibility]
    accessibility[payload] = ACCESSIBILITY_IS_EMPTY
    return {
      ...state,
      accessibility
    }
  },
  'set accessibility to loading for' (state, {payload}) {
    const accessibility = [...state.accessibility]
    accessibility[payload] = ACCESSIBILITY_IS_LOADING
    return {
      ...state,
      accessibility
    }
  },
  'clear start' (state, action) {
    return {
      ...state,
      accessibility: []
    }
  }
}, {
  accessibility: []
})
