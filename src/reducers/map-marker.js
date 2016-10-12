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
  'set origin' (state, {payload}) {
    return Object.assign({}, state, { origin: payload })
  },
  'set destination' (state, {payload}) {
    return Object.assign({}, state, {
      destination: payload
    })
  },
  'clear end' (state) {
    return {
      ...state,
      destination: null
    }
  },
  'clear start' (state) {
    return {
      ...state,
      origin: null
    }
  }
}, {
  origin: {},
  destination: {}
})
