import {handleActions} from 'redux-actions'

export default handleActions({
  'set base active' (state, action) {
    state.active = 'base'
    return state
  },
  'set comparison active' (state, action) {
    state.active = 'comparison'
    return state
  },
  'set browsochrones base' (state, action) {
    state.base = action.payload
    return state
  },
  'set browsochrones comparison' (state, action) {
    state.comparison = action.payload
    return state
  }
}, {
  active: 'base',
  base: null,
  comparison: null
})
