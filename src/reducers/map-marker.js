import {handleActions} from 'redux-actions'

export default handleActions({
  'hide map marker' (state, {payload}) {
    return Object.assign({}, state, {
      [payload.id]: null
    })
  },
  'show map marker' (state, {payload}) {
    return Object.assign({}, state, {
      [payload.id]: payload
    })
  },
  'set origin' (state) {
    return Object.assign({}, state, {destination: null})
  },
  'clear destination' (state) {
    return Object.assign({}, state, {destination: null})
  }
}, {
  origin: {
    latlng: {},
    label: ''
  },
  destination: {}
})
