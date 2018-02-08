// @flow
import {handleActions} from 'redux-actions'

export default handleActions({
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
  'set origin' (state, action) {
    const origins = [...state.origins]
    const originIndex = origins.findIndex((o) => o.name === action.payload.name)

    if (originIndex > -1) {
      origins[originIndex] = {...origins[originIndex], ...action.payload}
    } else {
      origins.push(action.payload)
    }

    return {
      ...state,
      origins
    }
  },
  'set active origin' (state, action) {
    const origins = [...state.origins]

    return {
      ...state,
      origins: origins.map(o => o.name === action.payload ? {...o, active: true} : {...o, active: false})
    }
  }
}, {
  origins: [],
  grids: []
})
