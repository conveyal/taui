import lonlat from '@conveyal/lonlat'

import {pointToCoordinate} from '../utils/coordinate-to-point'

import {updateStartPosition} from './location'
import {updateMap} from './map'

/**
 * Used for debugging on the command line.
 */
export const fetchAllTimesAndPathsForIndex = index => (dispatch, getState) => {
  const state = getState()
  const n = state.data.networks[0]
  const x = index % n.width
  const y = Math.floor(index / n.width)
  const centerCoordinates = pointToCoordinate(n.west + x, n.north + y, n.zoom)

  dispatch(updateMap({centerCoordinates: lonlat.toLeaflet(centerCoordinates)}))
  dispatch(updateStartPosition(centerCoordinates))
}
