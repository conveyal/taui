import {handleActions} from 'redux-actions'

export default handleActions({
  'set browsochrones' (state, action) {
    return action.payload
  }
}, {})
