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
    const {browsochrones, point, latlng} = action.payload
    const transitive = browsochrones.generateTransitiveData(point)
    transitive.key = `${lonlng.toString(latlng)}`
    const travelTime = browsochrones.surface.surface[point.y * browsochrones.query.width + point.x]

    return Object.assign({}, state, {transitive, travelTime})
  },
  'clear destination' (state, action) {
    return Object.assign({}, state, {transitive: null})
  }
}, {
  geojson: [],
  map: null,
  transitive: null,
  travelTime: 0,
  zoom: 11
})
