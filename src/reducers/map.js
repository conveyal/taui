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
  'set transitive network' (state, action) {
    const {data, latlng} = action.payload
    const base = data[0]
    const comparison = data[1]

    base.transitive.key = `${lonlng.toString(latlng)}`

    return Object.assign({}, state, {
      transitive: base.transitive,
      travelTime: base.travelTime,
      oldTravelTime: comparison.travelTime
    })
  },
  'clear destination' (state, action) {
    return Object.assign({}, state, {transitive: null})
  }
}, {
  geojson: [],
  map: null,
  transitive: null,
  travelTime: 0,
  oldTravelTime: 0,
  zoom: 11
})
