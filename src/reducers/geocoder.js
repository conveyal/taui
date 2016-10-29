import {handleActions} from 'redux-actions'

export default handleActions({
  'set origin' (state, {payload}) {
    return {
      ...state,
      origin: {
        label: payload.label,
        value: payload.latlng ? `${payload.latlng.lng},${payload.latlng.lat}` : false
      }
    }
  },
  'set destination' (state, {payload}) {
    return {
      ...state,
      destination: {
        label: payload.label,
        value: payload.latlng ? `${payload.latlng.lng},${payload.latlng.lat}` : false
      }
    }
  },
  'clear start' (state) {
    return {
      ...state,
      origin: null
    }
  },
  'clear end' (state) {
    return {
      ...state,
      destination: null
    }
  }
}, {
  origin: null,
  destination: null
})
