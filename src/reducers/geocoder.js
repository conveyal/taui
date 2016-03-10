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
  'clear destination' (state) {
    return Object.assign({}, state, { destination: null })
  }
}, {
  origin: null,
  destination: null
})
