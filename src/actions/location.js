import { reverseGeocode } from '../services/geocode'

import { addActionLogItem } from './log'
import {
  fetchAllTimesAndPathsForCoordinate,
  setNetworksToLoading
} from './network'

export const setEnd = end => ({
  type: 'set end',
  payload: end
})

export const setStart = start => ({
  type: 'set start',
  payload: start
})

/**
 * Update the start
 */
export function updateStart (value) {
  if (value) {
    if (value.label && value.position) {
      return [
        setNetworksToLoading(),
        addActionLogItem(`Updating start to ${value.label}`),
        setStart(value),
        fetchAllTimesAndPathsForCoordinate(value.position)
      ]
    } else if (value.position) {
      return updateStartPosition(value.position)
    }
  } else {
    return [addActionLogItem('Clearing start'), setStart()]
  }
}

export const updateStartPosition = position => (dispatch, getState) => {
  dispatch([
    fetchAllTimesAndPathsForCoordinate(position),
    setStart({ position }) // so the marker updates quickly
  ])

  const { geocoder, map } = getState()
  reverseGeocode(position, map.accessToken, geocoder).then(features => {
    dispatch(setStart({ position, label: features[0].place_name }))
  })
}

/**
 * Update the end point
 */
export const updateEnd = value => {
  if (value) {
    if (value.label && value.position) {
      return [addActionLogItem(`Updating end to ${value.label}`), setEnd(value)]
    } else if (value.position) {
      return updateEndPosition(value.position)
    }
  } else {
    return [addActionLogItem('Clearing end'), setEnd()]
  }
}

export const updateEndPosition = position => (dispatch, getState) => {
  dispatch(setEnd({ position }))

  const { geocoder, map } = getState()
  reverseGeocode(position, map.accessToken, geocoder).then(features => {
    dispatch(setEnd({ position, label: features[0].place_name }))
  })
}
