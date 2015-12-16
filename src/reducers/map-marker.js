import {handleActions} from 'redux-actions'

const initialMapMarker = {
  isDragging: false,
  position: [],
  description: ''
}

const mapMarkerReducers = handleActions({
  UPDATE_MAP_MARKER: (state, action) => {
    return Object.assign({}, action.payload)
  }
}, initialMapMarker)

export default mapMarkerReducers
