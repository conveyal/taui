import {combineReducers} from 'redux'

import actionLog from './action-log'
import browsochrones from './browsochrones'
import destinations from './destinations'
import geocoder from './geocoder'
import map from './map'
import mapMarkers from './map-marker'
import project from './project'
import singlePoint from './single-point'
import timeCutoff from './time-cutoff'
import transitMode from './transit-mode'
import transitScenario from './transit-scenario'

const placeApp = combineReducers({
  actionLog,
  browsochrones,
  destinations,
  geocoder,
  map,
  mapMarkers,
  project,
  singlePoint,
  timeCutoff,
  transitMode,
  transitScenario
})

export default placeApp
