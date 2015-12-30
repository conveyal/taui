import {handleActions} from 'redux-actions'

export default handleActions({
  'update selected transit scenario' (state, action) {
    return Object.assign({}, state, { selected: action.payload })
  }
}, {
  scenarios: [],
  selected: {}
})
