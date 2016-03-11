import lonlng from 'lonlng'
import {handleActions} from 'redux-actions'

export default handleActions({
  'update map' (state, action) {
    return Object.assign({}, state, action.payload)
  },
  'clear isochrone' (state, action) {
    return Object.assign({}, state, { geojson: [] })
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

    base.transitive.key = `base-${lonlng.toString(latlng)}`
    comparison.transitive.key = `comparison-${lonlng.toString(latlng)}`

    return Object.assign({}, state, {
      base,
      comparison,
      transitive: base.transitive
    })
  },
  'clear destination' (state, action) {
    return Object.assign({}, state, {transitive: null})
  }
}, {
  geojson: [],
  map: null,
  transitive: null,
  base: {},
  comparison: {},
  zoom: 11
})
