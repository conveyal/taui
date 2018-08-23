// @flow
import lonlat from '@conveyal/lonlat'

import {setKeyTo} from '../utils/hash'

/**
 * Update the map and store the settings as query parameters in the URL
 */
export function updateMap (payload: any) {
  if (payload.zoom) {
    setKeyTo('zoom', payload.zoom)
  }

  if (payload.centerCoordinates) {
    setKeyTo(
      'centerCoordinates',
      lonlat.toString(payload.centerCoordinates)
    )
  }

  return {
    type: 'update map',
    payload
  }
}
