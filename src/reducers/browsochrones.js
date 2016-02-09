import {handleActions} from 'redux-actions'

export default handleActions({
  'set browsochrones' (state, action) {
    state.instance = action.payload
    return state
  }
}, {
  instance: null
})
