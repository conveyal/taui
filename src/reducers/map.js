// @flow
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'update map' (state, action) {
      return {...state, ...action.payload}
    },
    'clear isochrone' (state, action) {
      return {...state, geojson: []}
    },
    'set isochrone for' (state, {payload}) {
      const {index, isochrone} = payload
      const isochrones = [...state.isochrones]
      isochrones[index] = isochrone
      return {
        ...state,
        geojson: state.active === index ? [isochrone] : state.geojson,
        isochrones
      }
    },
    'set isochrone' (state, action) {
      return {
        ...state,
        geojson: [action.payload]
      }
    },
    'set start' (state) {
      return {
        ...state,
        transitive: null
      }
    },
    'set destination data for' (state, {payload}) {
      const {data, index} = payload

      const inVehicleTravelTimes = [...state.inVehicleTravelTimes]
      const transitives = [...state.transitives]
      const travelTimes = [...state.travelTimes]
      const waitTimes = [...state.waitTimes]

      inVehicleTravelTimes[index] = data.inVehicleTravelTime
      transitives[index] = data.transitive
      travelTimes[index] = data.travelTime
      waitTimes[index] = data.waitTime

      return {
        ...state,
        inVehicleTravelTimes,
        transitive: state.active === index ? data.transitive : state.transitive,
        transitives,
        travelTimes,
        waitTimes
      }
    },
    'clear start' (state, action) {
      return {
        ...state,
        geojson: [],
        isochrones: [],
        transitives: [],
        travelTimes: []
      }
    },
    'clear end' (state, action) {
      return {
        ...state,
        transitive: null,
        transitives: [],
        travelTimes: [],
        inVehicleTravelTimes: [],
        waitTimes: []
      }
    }
  },
  {
    active: 0,
    geojson: [],
    map: null,
    transitive: null,
    isochrones: [],
    transitives: [],
    travelTimes: [],
    inVehicleTravelTimes: [],
    waitTimes: [],
    zoom: 11
  }
)
