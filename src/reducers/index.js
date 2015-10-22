import { combineReducers } from 'redux'

import actionLog from './action-log'
import destinations from './destinations'
import * as actions from '../actions'
import map from './map'
import mapMarker from './map-marker'

/**
 * Single Point Request
 */

const initialSinglePointRequestState = {}

function singlePointRequest (state = initialSinglePointRequestState, action) {
  switch (action.type) {
    case actions.REQUEST_SINGPLE_POINT:
    default:
      return state
  }
}

const placeApp = combineReducers({
  actionLog,
  destinations,
  map,
  mapMarker,
  singlePointRequest
})

export default placeApp
