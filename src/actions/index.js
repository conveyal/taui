import fetch from 'isomorphic-fetch'
import {stringify} from 'qs'
import {createAction} from 'redux-actions'

export const addActionLogItem = createAction('add action log item', (item) => {
  const payload = typeof item === 'string'
    ? { text: item }
    : item

  return Object.assign({
    createdAt: new Date(),
    level: 'info'
  }, payload)
})

export const updateMapMarker = createAction('update map marker')
export const updateMap = createAction('update map')
export const updateSelectedDestination = createAction('update selected destination')
export const updateSelectedProject = createAction('update selected project')
export const updateSelectedTransitMode = createAction('update selected transit mode')
export const updateSelectedTransitScenario = createAction('update selected transit scenario')
export const requestSinglePoint = createAction('request single point')
export const receiveSinglePoint = createAction('receive single point')

export function fetchSinglePoint (query) {
  return function (dispatch) {
    dispatch(requestSinglePoint(query))

    const qs = stringify({
      lat: query.position[0],
      lng: query.position[1],
      destinationPointsetId: query.destinationPointsetId,
      graphId: query.graphId
    })

    return fetch(`/api/singlePointRequest?${qs}`)
      .then(response => response.json())
      .then(json => dispatch(receiveSinglePoint(json)))
      .catch(e => console.error(e))
  }
}
