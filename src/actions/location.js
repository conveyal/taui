// @flow
import lonlat from '@conveyal/lonlat'

import type {Location, LonLat} from '../types'
import {setValues} from '../utils/hash'

import {addActionLogItem} from './log'
import {
  fetchAllTimesAndPathsForCoordinate,
  setNetworksToLoading
} from './network'
import {reverseGeocode} from './geocode'

const setLocation = (which: 'end' | 'start', location?: Location) => {
  if (location) {
    setValues({
      [`${which}`]: location.label,
      [`${which}Coordinate`]: location.position
        ? lonlat.toString(location.position)
        : null
    })
  } else {
    setValues({
      [`${which}`]: null,
      [`${which}Coordinate`]: null
    })
  }
}

export const setEnd = (end: any) => {
  setLocation('end', end)
  return {
    type: 'set end',
    payload: end
  }
}

export const setStart = (start: any) => {
  setLocation('start', start)
  return {
    type: 'set start',
    payload: start
  }
}

/**
 * Update the start
 */
export const updateStart = (value?: Location) =>
  value && value.label && value.position
    ? [
      setNetworksToLoading(),
      addActionLogItem(`Updating start to ${value.label}`),
      setStart(value),
      fetchAllTimesAndPathsForCoordinate(value.position)
    ]
    : [
      addActionLogItem('Clearing start'),
      setStart()
    ]

export const updateStartPosition = (position: LonLat) => [
  reverseGeocode(position, features =>
    setStart({position, label: features[0].place_name})
  ),
  fetchAllTimesAndPathsForCoordinate(position)
]

/**
 * Update the end point
 */
export const updateEnd = (value?: Location) => [
  addActionLogItem(value ? `Updating end to ${value.label}` : 'Clearing end'),
  setEnd(value)
]

export const updateEndPosition = (position: LonLat) =>
  reverseGeocode(position, features =>
    setEnd({position, label: features[0].place_name})
  )
