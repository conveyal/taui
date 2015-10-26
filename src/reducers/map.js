import dbg from 'debug'
import {handleActions} from 'redux-actions'

import config from '../config'

const debug = dbg('taui:reducers:map')

const initialMap = {
  center: config.center,
  mapbox: config.mapbox,
  zoom: config.zoom
}

const mapReducers = handleActions({
  UPDATE_MAP: (state, action) => {
    debug(`UPDATE_MAP: ${JSON.stringify(action.payload)}`)
    return Object.assign({}, state, action.payload)
  }
}, initialMap)

export default mapReducers
