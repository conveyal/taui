import {handleActions} from 'redux-actions'

const initialMap = {
  zoom: 13
}

const mapReducers = handleActions({
  UPDATE_MAP: (state, action) => {
    return Object.assign({}, state, action.payload)
  },
  UPDATE_MAP_MARKER: (state, {payload}) => {
    return Object.assign({}, state, {
      center: payload.position
    })
  }
}, initialMap)

export default mapReducers
