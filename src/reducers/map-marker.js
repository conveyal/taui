import {handleActions} from 'redux-actions'

const initialMapMarker = {
  originMarker: {
    isDragging: false,
    position: [],
    text: ''
  },
  destinationMarker: null
}

const mapMarkerReducers = handleActions({
  UPDATE_MAP_MARKER: (state, action) => {
    return Object.assign(state, action.payload)
  }
}, initialMapMarker)

export default mapMarkerReducers
