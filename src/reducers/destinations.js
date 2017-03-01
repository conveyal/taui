import {handleActions} from 'redux-actions'

export default handleActions({
  'set accessibility for' (state, {payload}) {
    const accessibility = [...state.accessibility]
    accessibility[payload.index] = payload.accessibility
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
