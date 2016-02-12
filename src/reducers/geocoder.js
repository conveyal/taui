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
  }
}, {
  origin: null,
  destination: null
})
