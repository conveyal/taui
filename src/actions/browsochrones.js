import Browsochrones from 'browsochrones'
import {createAction} from 'redux-actions'
import {bind} from 'redux-effects'
import {fetch} from 'redux-effects-fetch'

import {addActionLogItem} from './index'

export const setAccessibility = createAction('set accessibility')
export const setSurface = createAction('set surface')
export const requestGrid = createAction('request grid')
export const receiveGrid = createAction('receive grid')

export function generateSurfaceIfLoaded (browsochrones, grid) {
  if (browsochrones.isLoaded()) {
    browsochrones.generateSurface()
    return [
      setSurface(Date.now()),
      setAccessibilityForGrid({browsochrones, grid})
    ]
  }
}

export const setAccessibilityForGrid = createAction('set accessibility for grid', ({ browsochrones, grid }) => {
  if (!grid || !browsochrones.surface) return 0
  return browsochrones.getAccessibilityForGrid(grid)
})

export function fetchGrid (browsochrones, url, name) {
  return [
    requestGrid(name),
    bind(
      fetch(`${url}/${name}.grid`),
      ({value}) => {
        const grid = new Browsochrones.Grid(value)
        browsochrones.grids = browsochrones.grids || {}
        browsochrones.grids[name] = grid
        return [receiveGrid({name, grid}), generateSurfaceIfLoaded(browsochrones)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}

export const requestOrigin = createAction('request origin')
export const receiveOrigin = createAction('receive origin')

export function fetchOrigin ({browsochrones, grid, origin, url}) {
  return [
    requestOrigin(origin),
    bind(
      fetch(`${url}/${origin.x | 0}/${origin.y | 0}.dat`),
      ({value}) => {
        browsochrones.setOrigin(value, origin)

        return [receiveOrigin(origin), generateSurfaceIfLoaded(browsochrones, grid)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}

export function updateOrigin ({browsochrones, grid, origin, url}) {
  // get the pixel coordinates
  const actions = []

  actions.push(addActionLogItem(`Retrieving isochrones for origin [${origin.x},  ${origin.y}]`))

  if (!browsochrones.coordinatesInQueryBounds(origin)) {
    actions.push(addActionLogItem('Origin out of bounds'))
  } else {
    actions.push(fetchOrigin({
      browsochrones,
      grid,
      origin,
      url
    }))
  }

  return actions
}

export const requestQuery = createAction('request query')
export const receiveQuery = createAction('receive query')

export function fetchQuery (browsochrones, url) {
  return [
    requestQuery(url),
    bind(
      fetch(url),
      ({value}) => {
        browsochrones.setQuery(value)

        return [receiveQuery(Date.now()), generateSurfaceIfLoaded(browsochrones)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}

export const requestStopTrees = createAction('request stop trees')
export const receiveStopTrees = createAction('receive stop trees')

export function fetchStopTrees (browsochrones, url) {
  return [
    requestStopTrees(url),
    bind(
      fetch(url),
      ({value}) => {
        browsochrones.setStopTrees(value)

        return [receiveStopTrees(Date.now()), generateSurfaceIfLoaded(browsochrones)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}

export const requestTransitiveNetwork = createAction('request transitive network')
export const receiveTransitiveNetwork = createAction('receive transitive network')

export function fetchTransitiveNetwork (browsochrones, url) {
  return [
    requestTransitiveNetwork(url),
    bind(
      fetch(url),
      ({value}) => {
        browsochrones.setTransitiveNetwork(value)

        return [receiveTransitiveNetwork(Date.now()), generateSurfaceIfLoaded(browsochrones)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}
