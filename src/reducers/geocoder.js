import {handleActions} from 'redux-actions'

function setQueryParameters ({
  start,
  end
}) {
  window.location.search = `start=${start}&end=${end}`
}

export default handleActions({
  'set origin' (state, {payload}) {
    setQueryParameters({
      start: payload.label,
      end: state.destination.label
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
      start: state.origin.label,
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
