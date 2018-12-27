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
      const c = get(action, 'payload.position') || state.centerCoordinates
      const ll = lonlat(c)
      return {
        ...state,
        centerCoordinates: {lat: c.lat, lng: c.lon}
      }
    }
  },
  {
    zoom: 13
  }
)
