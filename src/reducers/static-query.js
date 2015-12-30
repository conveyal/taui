import {handleActions} from 'redux-actions'

export default handleActions({
  'update static query' (state, action) {
    return action.payload
  }
}, {
  query: null
})
