// @flow
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'clear data' (state) {
      return {
        grids: [],
        networks: []
      }
    },
    'set grid' (state, action) {
      const grids = [...state.grids]
      const gridIndex = grids.findIndex(g => g.name === action.payload.name)

      if (gridIndex > -1) {
        grids[gridIndex] = {...grids[gridIndex], ...action.payload}
      } else {
        grids.push(action.payload)
      }

      return {
        ...state,
        grids
      }
    },
    'set network' (state, action) {
      const networks = [...state.networks]
      const networkIndex = networks.findIndex(
        n => n.name === action.payload.name
      )

      if (networkIndex > -1) {
        networks[networkIndex] = {...networks[networkIndex], ...action.payload}
      } else {
        networks.push(action.payload)
      }

      return {
        ...state,
        networks
      }
    },
    'set active network' (state, action) {
      const networks = [...state.networks]

      return {
        ...state,
        networks: networks.map(
          n =>
            (n.name === action.payload
              ? {...n, active: true}
              : {...n, active: false})
        )
      }
    },
    'set points of interest' (state, action) {
      return {
        ...state,
        pointsOfInterest: action.payload
      }
    }
  },
  {
    grids: [],
    networks: []
  }
)
