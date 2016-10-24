import lonlng from 'lonlng'
import {handleActions} from 'redux-actions'

export default handleActions({
  'update map' (state, action) {
    return Object.assign({}, state, action.payload)
  },
  'clear isochrone' (state, action) {
    return Object.assign({}, state, { geojson: [] })
  },
  'set isochrones' (state, {payload}) {
    return {
      ...state,
      geojson: [payload[payload.active]],
      baseIsochrone: payload.base,
      comparisonIsochrone: payload.comparison
    }
  },
  'set isochrone' (state, action) {
    return {
      ...state,
      geojson: [action.payload]
    }
  },
  'set origin' (state) {
    return Object.assign({}, state, {transitive: null})
  },
  'set transitive network' (state, {payload}) {
    const {active, data, latlng} = payload
    const base = data[0]
    const comparison = data[1]

    base.transitive.key = `base-${lonlng.toString(latlng)}`
    comparison.transitive.key = `comparison-${lonlng.toString(latlng)}`

    const transitive = active === 'base'
      ? base.transitive
      : comparison.transitive

    return {
      ...state,
      baseInVehicleTravelTime: base.inVehicleTravelTime,
      baseTransitive: base.transitive,
      baseTravelTime: base.travelTime,
      baseWaitTime: base.waitTime,
      comparisonInVehicleTravelTime: comparison.inVehicleTravelTime,
      comparisonTransitive: comparison.transitive,
      comparisonTravelTime: comparison.travelTime,
      comparisonWaitTime: comparison.waitTime,
      transitive
    }
  },
  'set base active' (state, action) {
    return Object.assign({}, state, {
      geojson: [state.baseIsochrone],
      transitive: state.baseTransitive
    })
  },
  'set comparison active' (state, action) {
    return Object.assign({}, state, {
      geojson: [state.comparisonIsochrone],
      transitive: state.comparisonTransitive
    })
  },
  'clear start' (state, action) {
    return {
      ...state,
      geojson: [],
      baseIsochrone: null,
      baseTransitive: null,
      baseTravelTime: null,
      comparisonIsochrone: null,
      comparisonTransitive: null,
      comparisonTravelTime: null
    }
  },
  'clear end' (state, action) {
    return {
      ...state,
      transitive: null
    }
  }
}, {
  geojson: [],
  map: null,
  transitive: null,
  baseIsochrone: null,
  baseTransitive: {},
  baseTravelTime: null,
  comparisonIsochrone: null,
  comparisonTransitive: {},
  comparisonTravelTime: null,
  zoom: 11
})
