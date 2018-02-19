// @flow
import lonlat from '@conveyal/lonlat'

import * as geocode from './geocode'
import * as grid from './grid'
import * as location from './location'
import * as log from './log'
import * as network from './network'
import {setKeyTo} from '../utils/hash'

const setSelectedTimeCutoff = (payload: number) => ({
  type: 'set selected time cutoff',
  payload
})

/**
 * Update the map and store the settings as query parameters in the URL
 */
const updateMap = (payload: any) => {
  if (payload.zoom) {
    setKeyTo('zoom', payload.zoom)
  }

  if (payload.centerCoordinates) {
    setKeyTo(
      'centerCoordinates',
      lonlat.toLatFirstString(payload.centerCoordinates)
    )
  }

  return {
    type: 'update map',
    payload
  }
}

export default {
  ...geocode,
  ...grid,
  ...location,
  ...log,
  ...network,
  setSelectedTimeCutoff,
  updateMap
}
