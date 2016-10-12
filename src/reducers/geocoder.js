import {handleActions} from 'redux-actions'

export default handleActions({
  'set origin' (state, {payload}) {
    return Object.assign({}, state, {
      origin: {
        label: payload.label,
        value: `${payload.latlng.lng},${payload.latlng.lat}`
      }
    })
  },
  'set destination' (state, {payload}) {
    return Object.assign({}, state, {
      destination: {
        label: payload.label,
        value: `${payload.latlng.lng},${payload.latlng.lat}`
      }
    })
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
