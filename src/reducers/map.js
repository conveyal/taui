// @flow
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'update map' (state, action) {
      return {...state, ...action.payload}
    },
    'set start' (state, action) {
      const newCenter = action.payload && action.payload.position
      return {
        ...state,
        centerCoordinates: newCenter
      }
    }
  },
  {
    zoom: 13
  }
)
