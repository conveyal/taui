import {handleActions} from 'redux-actions'

export default handleActions({
  'update map' (state, action) {
    return Object.assign({}, state, action.payload)
  },
  'set isochrone' (state, action) {
    return Object.assign({}, state, {
      geojson: [action.payload]
    })
  },
  'set origin' (state) {
    return Object.assign({}, state, {transitive: null})
  },
  'set transitive network' (state, action) {
    return Object.assign({}, state, {
      transitive: action.payload
    })
  },
  'clear destination' (state, action) {
    return Object.assign({}, state, {transitive: null})
  }
}, {
  geojson: [],
  map: null,
  transitive: null,
  zoom: 11
})
