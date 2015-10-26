import dbg from 'debug'
import {handleActions} from 'redux-actions'

import config from '../config'

const debug = dbg('taui:reducers:map-marker')

const initialMapMarker = {
  position: config.center,
  description: ''
}

const mapMarkerReducers = handleActions({
  UPDATE_MAP_MARKER: (state, action) => {
    debug(`UPDATE_MAP_MARKER: ${JSON.stringify(action.payload)}`)
    return Object.assign({}, action.payload)
  }
}, initialMapMarker)

export default mapMarkerReducers
