import {handleActions} from 'redux-actions'

export default handleActions({
  'update selected project' (state, action) {
    return Object.assign({}, state, { selected: action.payload })
  }
}, {
  projects: [],
  selected: {}
})
