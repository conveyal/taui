import {handleActions} from 'redux-actions'

import config from '../config'

const mapReducers = handleActions({
  UPDATE_MAP: (state, action) => {
    return Object.assign({}, state, action.payload)
  },
  UPDATE_MAP_MARKER: (state, {payload}) => {
    return Object.assign({}, state, {
      center: payload.position
    })
  }
}, config.map)

export default mapReducers
