// @flow
import lonlat from '@conveyal/lonlat'
import get from 'lodash/get'
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'update map' (state, action) {
      return {...state, ...action.payload}
    },
    'set start' (state, action) {
      const c = get(action, 'payload.position')
      return {
        ...state,
        centerCoordinates: c ? lonlat.toLeaflet(c) : state.centerCoordinates
      }
    }
  },
  {
    zoom: 13
  }
)
