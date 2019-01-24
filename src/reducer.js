export default function reducer (state, action) {
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
    case 'set active network':
      return setActiveNetwork(state, action)
    case 'set end':
      return {
        ...state,
        end: action.payload
      }
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
      return {
        ...state,
        start: action.payload
      }
    case 'set time cutoff':
      return {
        ...state,
        timeCutoff: action.payload
      }
    case 'update map':
      return {
        ...state,
        map: {
          ...state.map,
          ...action.payload
        }
      }
    default:
      console.error(`No reducer found for ${action.type}.`)
      return state
  }
}

function setActiveNetwork (state, action) {
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
