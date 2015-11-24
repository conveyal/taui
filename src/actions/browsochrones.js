import fetch from 'isomorphic-fetch'
import {createAction} from 'redux-actions'

export const SET_ACCESSIBILITY = 'SET_ACCESSIBILITY'
export const setAccessibility = createAction(SET_ACCESSIBILITY)

export const SET_SURFACE = 'SET_SURFACE'
export const setSurface = createAction(SET_SURFACE)

export const REQUEST_GRID = 'REQUEST_GRID'
export const requestGrid = createAction(REQUEST_GRID)

export const RECEIVE_GRID = 'RECEIVE_GRID'
export const receiveGrid = createAction(RECEIVE_GRID)

export function fetchGrid (url) {
  return function (dispatch) {
    dispatch(requestGrid(url))

    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(grid => dispatch(receiveGrid(grid)))
  }
}

export const REQUEST_ORIGIN = 'REQUEST_ORIGIN'
export const requestOrigin = createAction(REQUEST_ORIGIN)

export const RECEIVE_ORIGIN = 'RECEIVE_ORIGIN'
export const receiveOrigin = createAction(RECEIVE_ORIGIN)

export function fetchOrigin (url, coordinates) {
  return function (dispatch) {
    dispatch(requestOrigin(coordinates))

    return fetch(`${url}/${coordinates.x | 0}/${coordinates.y | 0}.dat`)
      .then(res => res.arrayBuffer())
      .then(data => dispatch(receiveOrigin(data)))
  }
}

export const REQUEST_QUERY = 'REQUEST_QUERY'
export const requestQuery = createAction(REQUEST_QUERY)

export const RECEIVE_QUERY = 'RECEIVE_QUERY'
export const receiveQuery = createAction(RECEIVE_QUERY)

export function fetchQuery (url) {
  return function (dispatch) {
    dispatch(requestQuery(url))

    return fetch(url)
      .then(res => res.json())
      .then(query => dispatch(receiveQuery(query)))
  }
}

export const REQUEST_STOP_TREES = 'REQUEST_STOP_TREES'
export const requestStopTrees = createAction(REQUEST_STOP_TREES)

export const RECEIVE_STOP_TREES = 'RECEIVE_STOP_TREES'
export const receiveStopTrees = createAction(RECEIVE_STOP_TREES)

export function fetchStopTrees (url) {
  return function (dispatch) {
    dispatch(requestStopTrees(url))

    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(stopTrees => dispatch(receiveStopTrees(stopTrees)))
  }
}
