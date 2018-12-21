// @flow
import lonlat from '@conveyal/lonlat'
import fetch from '@conveyal/woonerf/fetch'

import {ACCESSIBILITY_IS_LOADING, ACCESSIBILITY_IS_EMPTY} from '../constants'
import type {LonLat} from '../types'
import cacheURL from '../utils/cache-url'
import coordinateToPoint, {pointToCoordinate} from '../utils/coordinate-to-point'
import {parsePathsData, warnForInvalidPaths} from '../utils/parse-paths-data'
import {parseTimesData} from '../utils/parse-times-data'

import {updateStartPosition} from './location'
import {addActionLogItem as logItem, logError} from './log'
import {updateMap} from './map'

export const setNetwork = (payload: any) => ({type: 'set network', payload})
export const setActiveNetwork = (payload: string) => ({
  type: 'set active network',
  payload
})

export const setNetworksAccessibilityTo = (value: string) => (
  dispatch: Dispatch,
  getState: any
) => {
  const state = getState()
  dispatch(
    state.data.networks.map(network =>
      setNetwork({
        ...network,
        accessibility: value,
        originPoint: null,
        paths: null,
        targets: null,
        travelTimeSurface: null
      })
    )
  )
}
export const setNetworksToLoading = () =>
  setNetworksAccessibilityTo(ACCESSIBILITY_IS_LOADING)
export const setNetworksToEmpty = () =>
  setNetworksAccessibilityTo(ACCESSIBILITY_IS_EMPTY)

/**
 * Used for debugging on the command line.
 */
export const fetchAllTimesAndPathsForIndex = (index: number) => (
  dispatch: Dispatch,
  getState: any
) => {
  const state = getState()
  const n = state.data.networks[0]
  const x = index % n.width
  const y = Math.floor(index / n.width)
  const centerCoordinates = pointToCoordinate(n.west + x, n.north + y, n.zoom)

  dispatch(updateMap({centerCoordinates}))
  dispatch(updateStartPosition(lonlat.fromLeaflet(centerCoordinates)))
}

export const fetchAllTimesAndPathsForCoordinate = (coordinate: LonLat) => (
  dispatch: Dispatch,
  getState: any
) => {
  const state = getState()
  const currentZoom = state.map.zoom
  dispatch(
    state.data.networks.map(network =>
      fetchTimesAndPathsForNetworkAtCoordinate(network, coordinate, currentZoom)
    )
  )
}

const fetchTimesAndPathsForNetworkAtCoordinate = (network, coordinate, currentZoom) => {
  const originPoint = coordinateToPoint(
    coordinate,
    network.zoom,
    network.west,
    network.north
  )
  const index = originPoint.x + originPoint.y * network.width
  return [
    logItem(`Fetching data for index ${index} (x: ${originPoint.x}, y: ${originPoint.y})...`),
    fetchTimesAndPathsForNetworkAtIndex(network, originPoint, index)
  ]
}

const fetchTimesAndPathsForNetworkAtIndex = (network, originPoint, index) => [
  setNetwork({
    ...network,
    originPoint,
    paths: null,
    pathsPerTarget: null,
    targets: null,
    travelTimeSurface: null
  }),
  fetch({
    url: cacheURL(`${network.url}/${index}_paths.dat`),
    next: (error, response) => {
      if (error) {
        console.error(error)
        return logError(error.status === 400
          ? 'Paths data not available for these coordinates.'
          : 'Error while retrieving paths for these coordinates.')
      }

      const {paths, pathsPerTarget, targets} = parsePathsData(response.value)

      if (process.env.NODE_ENV === 'test') {
        warnForInvalidPaths(paths, network.transitive)
      }

      return [
        logItem(`Found paths for ${index}...`),
        setNetwork({
          name: network.name,
          paths,
          pathsPerTarget,
          targets
        })
      ]
    }
  }),
  fetch({
    url: cacheURL(`${network.url}/${index}_times.dat`),
    next: (error, timesResponse) => {
      if (error) {
        console.error(error)
        return logError(error.status === 400
          ? 'Data not available for these coordinates.'
          : 'Error while retrieving data for these coordinates.')
      }

      const travelTimeSurface = parseTimesData(timesResponse.value)
      return [
        logItem(`Found times for ${index}...`),
        setNetwork({
          name: network.name,
          travelTimeSurface
        })
      ]
    }
  })
]
