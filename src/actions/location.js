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
  reverseGeocode(position, features =>
    setStart({position, label: features[0].place_name})
  ),
  fetchAllTimesAndPathsForCoordinate(position)
]

/**
 * Update the end point
 */
export const updateEnd = (value) => [
  addActionLogItem(value ? `Updating end to ${value.label}` : 'Clearing end'),
  setEnd(value)
]

export const updateEndPosition = (position) =>
  reverseGeocode(position, features =>
    setEnd({position, label: features[0].place_name})
  )
