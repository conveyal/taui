import {handleActions} from 'redux-actions'

export default handleActions({
  'receive grid' (state, action) {
    return Object.assign({}, state, { grid: action.payload })
  },
  'request origin' (state, action) {
    return Object.assign({}, state, { originCoordinates: action.payload })
  },
  'receive origin' (state, action) {
    return Object.assign({}, state, { originData: action.payload })
  },
  'receive query' (state, action) {
    return Object.assign({}, state, { query: action.payload })
  },
  'receive stop trees' (state, action) {
    return Object.assign({}, state, { stopTrees: action.payload })
  },
  'receive transitive network' (state, action) {
    return Object.assign({}, state, { transitiveNetwork: action.payload })
  },
  'set accessibility' (state, action) {
    return Object.assign({}, state, { accessibility: action.payload })
  },
  'set surface' (state, action) {
    return Object.assign({}, state, { surface: action.surface })
  }
}, {
  accessibility: 0,
  grid: null,
  isolineTimeCutoff: 60,
  originCoordinates: {},
  originData: null,
  query: null,
  stopTrees: null,
  surface: null,
  transitiveNetwork: null
})
