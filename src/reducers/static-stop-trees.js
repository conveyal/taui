import {handleActions} from 'redux-actions'

export default handleActions({
  'update static stop trees' (state, action) {
    return action.payload
  }
}, {
  stopTrees: null
})
