// @flow
import lonlat from '@conveyal/lonlat'
import fetch, {fetchMultiple} from '@conveyal/woonerf/fetch'

import {retrieveConfig, storeConfig} from '../config'
import {ACCESSIBILITY_IS_LOADING, ACCESSIBILITY_IS_EMPTY} from '../constants'
import type {LonLat} from '../types'
import cacheURL from '../utils/cache-url'
import coordinateToPoint, {pointToCoordinate} from '../utils/coordinate-to-point'
import {parsePathsData, warnForInvalidPaths} from '../utils/parse-paths-data'
import {parseTimesData} from '../utils/parse-times-data'

import {updateStartPosition} from './location'
import {addActionLogItem as logItem, logError} from './log'
import {updateMap} from './map'
import {loadPointsOfInterest} from './points-of-interest'
import {loadGrid} from './grid'

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
 * Download the initial set of data and set the state accordingly. First, check
 * and parse the query parameters. If there is a `start`, set the networks to
 * loading. Second, load the grids. Third, gecode the starting parameters
 */
export const initialize = (startCoordinate?: LonLat) => (dispatch, getState) => {
  if (process.env.DISABLE_CONFIG) {
    const state = getState()
    if (!startCoordinate && state.geocoder.proximity) {
      const centerCoordinates = lonlat(state.geocoder.proximity)
      dispatch(updateMap({centerCoordinates: lonlat.toLeaflet(centerCoordinates)}))
      dispatch(updateStartPosition(centerCoordinates))
    }

    dispatch(loadDataset(
      state.data.networks,
      state.data.grids,
      state.data.pointsOfInterestUrl,
      startCoordinate || lonlat.fromString(state.geocoder.proximity)
    ))
  } else {
    try {
      const json = retrieveConfig()
      if (json) {
        if (!json.networks) {
          window.alert('JSON config found in localStorage without a networks array.')
        } else {
          return dispatch(loadDataset(
            json.networks,
            json.grids,
            json.pointsOfInterestUrl,
            startCoordinate || json.startCoordinate
          ))
        }
      }
    } catch (e) {
      console.log('Error parsing taui-config', e)
    }

    dispatch(fetch({
      url: cacheURL('config.json'),
      next: response => {
        const c = response.value
        storeConfig(c)
        return loadDataset(
          c.networks,
          c.grids,
          c.pointsOfInterestUrl,
          startCoordinate || c.startCoordinate
        )
      }
    }))
  }
}

export function loadDatasetFromJSON (jsonConfig: any) {
  storeConfig(jsonConfig)
  return loadDataset(
    jsonConfig.networks,
    jsonConfig.grids,
    jsonConfig.pointsOfInterestUrl,
    jsonConfig.startCoordinate
  )
}

export const loadDataset = (
  networks: {name: string, showOnMap: boolean, url: string},
  grids: {icon: string, name: string, showOnMap: boolean, url: string},
  pointsOfInterestUrl?: string,
  startCoordinate?: LonLat
) => (dispatch: Dispatch, getState: any) => {
  dispatch({type: 'clear data'})

  // Try to load points of interest
  if (pointsOfInterestUrl) dispatch(loadPointsOfInterest(pointsOfInterestUrl))

  // Load all opportunity grids
  grids.forEach(grid => dispatch(loadGrid(grid)))

  // Log loading networks
  dispatch(logItem(
    `Fetching network data for ${networks.map(n => n.url).join(', ')}`))

  // Load all networks
  dispatch(fetchMultiple({
    fetches: networks.reduce((urls, n) => [
      ...urls,
      {url: cacheURL(`${n.url}/request.json`)},
      {url: cacheURL(`${n.url}/transitive.json`)}
    ], []),
    next: responses => {
      let offset = 0
      const fullNetworks = networks.map((network, index) => {
        const requestValue = responses[offset++].value
        // TODO remove when request data is moved to top level
        const request = requestValue.request || requestValue
        const transitive = responses[offset++].value
        return {
          ...network,
          ...request,
          ready: true,
          transitive
        }
      })

      // Set all the networks
      fullNetworks.forEach(n => dispatch(setNetwork(n)))

      // Load the config start coordinate or the center
      if (startCoordinate) {
        dispatch(fetchAllTimesAndPathsForCoordinate(startCoordinate))
      } else {
        // Center x / y of the first network
        dispatch(logItem(
          `No starting coordinate, fetching data for network center...`))
        const x = fullNetworks[0].west + fullNetworks[0].width / 2
        const y = fullNetworks[0].north + fullNetworks[0].height / 2
        const centerCoordinates = pointToCoordinate(x, y, fullNetworks[0].zoom)
        dispatch(updateMap({centerCoordinates}))
        dispatch({
          type: 'set geocoder',
          payload: {proximity: lonlat.toString(centerCoordinates)}
        })
        dispatch(updateStartPosition(centerCoordinates))
      }
    }
  }))
}

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
  dispatch({type: 'set geocoder', payload: {proximity: lonlat.toString(centerCoordinates)}})
  dispatch(updateStartPosition(centerCoordinates))
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
