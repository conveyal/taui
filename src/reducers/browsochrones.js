import {handleActions} from 'redux-actions'

export default handleActions({
  'set browsochrones base' (state, action) {
    state.base = action.payload
    return state
  },
  'set browsochrones comparison' (state, action) {
    state.comparison = action.payload
    return state
  }
}, {
  base: null,
  comparison: null
})
