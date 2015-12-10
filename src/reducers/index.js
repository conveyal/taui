import {combineReducers} from 'redux'
import {routerStateReducer as router} from 'redux-router'

import actionLog from './action-log'
import browsochrones from './browsochrones'
import destinations from './destinations'
import map from './map'
import mapMarkers from './map-marker'
import project from './project'
import singlePoint from './single-point'
import transitMode from './transit-mode'
import transitScenario from './transit-scenario'

const placeApp = combineReducers({
  actionLog,
  browsochrones,
  destinations,
  map,
  mapMarkers,
  project,
  router,
  singlePoint,
  transitMode,
  transitScenario
})

export default placeApp
