import {handleActions} from 'redux-actions'

export default handleActions({
  'update map marker' (state, action) {
    return Object.assign({}, state, action.payload)
  }
}, {
  originMarker: {
    latlng: {},
    text: ''
  },
  destinationMarker: null
})
