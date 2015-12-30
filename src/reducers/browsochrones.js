import Browsochrones from 'browsochrones'
import {handleActions} from 'redux-actions'

export default handleActions({
  'receive grid' (state, action) {
    state.instance.setGrid(action.payload)
    return Object.assign(state, { grid: action.payload })
  },
  'request origin' (state, action) {
    return Object.assign(state, { originCoordinates: action.payload })
  },
  'receive origin' (state, action) {
    const {x, y} = state.originCoordinates
    state.instance.setOrigin(action.payload, {x, y})
    return Object.assign(state, { originData: action.payload })
  },
  'receive query' (state, action) {
    state.instance.setQuery(action.payload)
    return Object.assign(state, { query: action.payload })
  },
  'receive stop trees' (state, action) {
    state.instance.setStopTrees(action.payload)
    return Object.assign(state, { stopTrees: action.payload })
  },
  'receive transitive network' (state, action) {
    state.instance.setTransitiveNetwork(action.payload)
    return Object.assign(state, { transitiveNetwork: action.payload })
  },
  'set accessibility' (state, action) {
    return Object.assign(state, { accessibility: action.payload })
  },
  'set surface' (state, action) {
    return Object.assign(state, { surface: action.surface })
  }
}, {
  accessibility: 0,
  grid: null,
  instance: new Browsochrones(),
  originCoordinates: {},
  originData: null,
  query: null,
  stopTrees: null,
  surface: null,
  transitiveNetwork: null
})
