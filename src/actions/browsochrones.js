import {createAction} from 'redux-actions'
import {bind} from 'redux-effects'
import {fetch} from 'redux-effects-fetch'

import {addActionLogItem} from './index'

export const setAccessibility = createAction('set accessibility')
export const setSurface = createAction('set surface')
export const requestGrid = createAction('request grid')
export const receiveGrid = createAction('receive grid')

export function generateIsochronesIfLoaded (browsochrones) {
  if (browsochrones.isLoaded()) {
    browsochrones.generateSurface()
    return [
      setSurface(Date.now()),
      setAccessibility(browsochrones.getAccessibilityForCutoff())
    ]
  }
}

export function fetchGrid (browsochrones, url) {
  return [
    requestGrid(url),
    bind(
      fetch(url),
      ({value}) => {
        browsochrones.setGrid(value)

        return [receiveGrid(Date.now()), generateIsochronesIfLoaded(browsochrones)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}

export const requestOrigin = createAction('request origin')
export const receiveOrigin = createAction('receive origin')

export function fetchOrigin ({browsochrones, origin, url}) {
  return [
    requestOrigin(origin),
    bind(
      fetch(`${url}/${origin.x | 0}/${origin.y | 0}.dat`),
      ({value}) => {
        browsochrones.setOrigin(value, origin)

        return [receiveOrigin(origin), generateIsochronesIfLoaded(browsochrones)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}

export function updateOrigin ({browsochrones, origin, url}) {
  // get the pixel coordinates
  const actions = []

  actions.push(addActionLogItem(`Retrieving isochrones for origin [${origin.x},  ${origin.y}]`))

  if (!browsochrones.coordinatesInQueryBounds(origin)) {
    actions.push(addActionLogItem(`Origin out of bounds`))
  } else {
    actions.push(fetchOrigin({
      browsochrones,
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

        return [receiveQuery(Date.now()), generateIsochronesIfLoaded(browsochrones)]
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

        return [receiveStopTrees(Date.now()), generateIsochronesIfLoaded(browsochrones)]
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

        return [receiveTransitiveNetwork(Date.now()), generateIsochronesIfLoaded(browsochrones)]
      },
      ({value}) => addActionLogItem(value)
    )
  ]
}
