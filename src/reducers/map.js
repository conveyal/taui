import lonlng from 'lonlng'
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
  'set transitive network' (state, {payload}) {
    const {browsochrones, point, latlng} = payload
    const transitive = browsochrones.generateTransitiveData(point)
    transitive.key = `${lonlng.toString(latlng)}`
    return Object.assign({}, state, {transitive})
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
