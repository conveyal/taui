import get from 'lodash/get'
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'update map' (state, action) {
      return {...state, ...action.payload}
    },
    'set start' (state, action) {
      return {
        ...state,
        centerCoordinates: get(action, 'payload.position') || state.centerCoordinates
      }
    }
  },
  {
    zoom: 13
  }
)
