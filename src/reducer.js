import * as qs from './utils/querystring'

export default function reducer (state = {}, action) {
  switch (action.type) {
    case 'add action log item':
      return {
        ...state,
        actionLog: [...state.actionLog, action.payload]
      }
    case 'clear data':
      return {
        ...state,
        grids: [],
        networks: []
      }
    case 'decrement fetches':
      return {
        ...state,
        activeFetches: state.activeFetches - 1
      }
    case 'increment fetches':
      return {
        ...state,
        activeFetches: isNaN(state.activeFetches) ? 1 : state.activeFetches + 1
      }
    case 'set active network':
      return {
        ...state,
        activeNetwork: action.payload
      }
    case 'set end':
      return setLocation('end')(state, action)
    case 'set geocoder':
      return {
        ...state,
        geocoder: action.payload
      }
    case 'set grid':
      return setGrid(state, action)
    case 'set network':
      return setNetwork(state, action)
    case 'set points of interest':
      return {
        ...state,
        pointsOfInterest: action.payload
      }
    case 'set start':
      return setLocation('start')(state, action)
    case 'set time cutoff':
      return {
        ...state,
        timeCutoff: action.payload
      }
    case 'update map':
      return updateMap(state, action)
    default:
      if (action.type.indexOf('@@redux/INIT') === -1) {
        console.error(`No reducer found for ${action.type}.`)
      }

      return state
  }
}

function setGrid (state, action) {
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
}

/**
 * Set start/end and save to querystring at the same time.
 */
function setLocation (location) {
  return function set (state, action) {
    qs.setKeyTo(location, action.payload)

    return {
      ...state,
      [`${location}`]: action.payload
    }
  }
}

function setNetwork (state, action) {
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
}

function updateMap (state, action) {
  const map = {
    ...state.map,
    ...action.payload
  }

  // Set the map in the query string
  qs.setKeyTo('map', {
    center: map.center,
    zoom: map.zoom
  })

  return {
    ...state,
    map
  }
}
