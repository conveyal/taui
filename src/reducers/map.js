import {handleActions} from 'redux-actions'

import config from '../config'

const initialMap = {
  center: config.center,
  mapbox: config.mapbox,
  zoom: config.zoom
}

const mapReducers = handleActions({
  UPDATE_MAP: (state, action) => {
    return Object.assign({}, state, action.payload)
  }
}, initialMap)

export default mapReducers
