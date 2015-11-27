import Browsochrones from 'browsochrones'
import {handleActions} from 'redux-actions'

const initialBrowsochrones = {
  accessibility: 0,
  grid: null,
  instance: new Browsochrones(),
  originCoordinates: {},
  originData: null,
  query: null,
  stopTrees: null,
  surface: null,
  transitiveNetwork: null
}

const browsochronesReducers = handleActions({
  RECEIVE_GRID: (state, action) => {
    state.instance.setGrid(action.payload)
    return Object.assign(state, { grid: action.payload })
  },
  REQUEST_ORIGIN: (state, action) => {
    return Object.assign(state, { originCoordinates: action.payload })
  },
  RECEIVE_ORIGIN: (state, action) => {
    const {x, y} = state.originCoordinates
    state.instance.setOrigin(action.payload, {x, y})
    return Object.assign(state, { originData: action.payload })
  },
  RECEIVE_QUERY: (state, action) => {
    state.instance.setQuery(action.payload)
    return Object.assign(state, { query: action.payload })
  },
  RECEIVE_STOP_TREES: (state, action) => {
    state.instance.setStopTrees(action.payload)
    return Object.assign(state, { stopTrees: action.payload })
  },
  RECEIVE_TRANSITIVE_NETWORK: (state, action) => {
    state.instance.setTransitiveNetwork(action.payload)
    return Object.assign(state, { transitiveNetwork: action.payload })
  },
  SET_ACCESSIBILITY: (state, action) => {
    return Object.assign(state, { accessibility: action.payload })
  },
  SET_SURFACE: (state, action) => {
    return Object.assign(state, { surface: action.surface })
  }
}, initialBrowsochrones)

export default browsochronesReducers
