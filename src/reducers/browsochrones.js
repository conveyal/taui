// @flow
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'set active browsochrones instance' (state, action) {
      return {
        ...state,
        active: action.payload
      }
    },
    'set browsochrones instances' (state, action) {
      return {
        ...state,
        instances: action.payload
      }
    }
  },
  {}
)
