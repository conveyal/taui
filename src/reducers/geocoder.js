import {handleActions} from 'redux-actions'

function setQueryParameters (opts) {
  window.location.hash = `start=${encodeURIComponent(opts.start)}&end=${encodeURIComponent(opts.end || '')}`
}

export default handleActions({
  'set origin' (state, {payload}) {
    setQueryParameters({
      start: payload.label,
      end: (state.destination && state.destination.label)
    })
    return {
      ...state,
      origin: {
        label: payload.label,
        value: `${payload.latlng.lng},${payload.latlng.lat}`
      }
    }
  },
  'set destination' (state, {payload}) {
    setQueryParameters({
      start: (state.origin && state.origin.label),
      end: payload.label
    })
    return {
      ...state,
      destination: {
        label: payload.label,
        value: `${payload.latlng.lng},${payload.latlng.lat}`
      }
    }
  },
  'clear start' (state) {
    setQueryParameters({
      start: null,
      end: (state.destination && state.destination.label)
    })
    return {
      ...state,
      origin: null
    }
  },
  'clear end' (state) {
    setQueryParameters({
      start: (state.origin && state.origin.label),
      end: null
    })
    return {
      ...state,
      destination: null
    }
  }
}, {
  origin: null,
  destination: null
})
