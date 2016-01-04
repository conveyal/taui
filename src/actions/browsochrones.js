import {createAction} from 'redux-actions'
import {bind} from 'redux-effects'
import {fetch} from 'redux-effects-fetch'

import {addActionLogItem} from './index'

export const setAccessibility = createAction('set accessibility')
export const showIsoLayer = createAction('show iso layer')
export const setSurface = createAction('set surface')
export const requestGrid = createAction('request grid')
export const receiveGrid = createAction('receive grid')

export function fetchGrid (url) {
  return [
    requestGrid(url),
    bind(
      fetch(url),
      ({value}) => receiveGrid(value),
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

        return [
          receiveOrigin(value),
          setSurface(browsochrones.generateSurface()),
          setAccessibility(browsochrones.getAccessibilityForCutoff()),
          showIsoLayer(true)
        ]
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
    actions.push(showIsoLayer(false))
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

export function fetchQuery (url) {
  return [
    requestQuery(url),
    bind(
      fetch(url),
      ({value}) => receiveQuery(value),
      ({value}) => addActionLogItem(value)
    )
  ]
}

export const requestStopTrees = createAction('request stop trees')
export const receiveStopTrees = createAction('receive stop trees')

export function fetchStopTrees (url) {
  return [
    requestStopTrees(url),
    bind(
      fetch(url),
      ({value}) => receiveStopTrees(value),
      ({value}) => addActionLogItem(value)
    )
  ]
}

export const requestTransitiveNetwork = createAction('request transitive network')
export const receiveTransitiveNetwork = createAction('receive transitive network')

export function fetchTransitiveNetwork (url) {
  return [
    requestTransitiveNetwork(url),
    bind(
      fetch(url),
      ({value}) => receiveTransitiveNetwork(value),
      ({value}) => addActionLogItem(value)
    )
  ]
}
