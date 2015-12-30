import fetch from 'isomorphic-fetch'
import {createAction} from 'redux-actions'

export const setAccessibility = createAction('set accessibility')
export const setSurface = createAction('set surface')
export const requestGrid = createAction('request grid')
export const receiveGrid = createAction('receive grid')

export function fetchGrid (url) {
  return function (dispatch) {
    dispatch(requestGrid(url))

    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(grid => dispatch(receiveGrid(grid)))
  }
}

export const requestOrigin = createAction('request origin')
export const receiveOrigin = createAction('receive origin')

export function fetchOrigin (url, coordinates) {
  return function (dispatch) {
    dispatch(requestOrigin(coordinates))

    return fetch(`${url}/${coordinates.x | 0}/${coordinates.y | 0}.dat`)
      .then(res => res.arrayBuffer())
      .then(data => dispatch(receiveOrigin(data)))
  }
}

export const requestQuery = createAction('request query')
export const receiveQuery = createAction('receive query')

export function fetchQuery (url) {
  return function (dispatch) {
    dispatch(requestQuery(url))

    return fetch(url)
      .then(res => res.json())
      .then(query => dispatch(receiveQuery(query)))
  }
}

export const requestStopTrees = createAction('request stop trees')
export const receiveStopTrees = createAction('receive stop trees')

export function fetchStopTrees (url) {
  return function (dispatch) {
    dispatch(requestStopTrees(url))

    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(stopTrees => dispatch(receiveStopTrees(stopTrees)))
  }
}

export const requestTransitiveNetwork = createAction('request transitive network')
export const receiveTransitiveNetwork = createAction('receive transitive network')

export function fetchTransitiveNetwork (url) {
  return function (dispatch) {
    dispatch(requestTransitiveNetwork(url))

    return fetch(url)
      .then(res => res.json())
      .then(network => dispatch(receiveTransitiveNetwork(network)))
  }
}
