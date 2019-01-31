import get from 'lodash/get'

import {addActionLogItem} from './log'
import {
  fetchAllTimesAndPathsForCoordinate,
  setNetworksToLoading
} from './network'
import {geocode, reverseGeocode} from './geocode'

export const setEnd = (end) => ({
  type: 'set end',
  payload: end
})

export const setStart = (start) => ({
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
    } else {
      return geocode(value.label, features =>
        updateStart({
          label: value.label,
          position: get(features, [0, 'center'])
        })
      )
    }
  } else {
    return [addActionLogItem('Clearing start'), setStart()]
  }
}

export const updateStartPosition = (position) => [
  fetchAllTimesAndPathsForCoordinate(position),
  setStart({position}), // so the marker updates quickly
  reverseGeocode(position, features =>
    setStart({position, label: features[0].place_name})
  )
]

/**
 * Update the end point
 */
export const updateEnd = (value) => {
  if (value) {
    if (value.label && value.position) {
      return [
        addActionLogItem(`Updating end to ${value.label}`),
        setEnd(value)
      ]
    } else if (value.position) {
      return updateEndPosition(value.position)
    }
  } else {
    return [addActionLogItem('Clearing end'), setEnd()]
  }
}

export const updateEndPosition = (position) => [
  setEnd({position}),
  reverseGeocode(position, features =>
    setEnd({position, label: features[0].place_name})
  )
]
