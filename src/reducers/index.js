import { combineReducers } from 'redux'

import actionLog from './action-log'
import destinations from './destinations'
import map from './map'
import mapMarker from './map-marker'
import singlePoint from './single-point'
import transitMode from './transit-mode'

const placeApp = combineReducers({
  actionLog,
  destinations,
  map,
  mapMarker,
  singlePoint,
  transitMode
})

export default placeApp
