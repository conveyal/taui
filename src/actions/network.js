// @flow
import fetch, {fetchMultiple} from '@conveyal/woonerf/fetch'

import {ACCESSIBILITY_IS_LOADING, ACCESSIBILITY_IS_EMPTY} from '../constants'
import coordinateToPoint from '../utils/coordinate-to-point'
import {parsePathsData, warnForInvalidPaths} from '../utils/parse-paths-data'
import {parseTimesData} from '../utils/parse-times-data'

import {loadPointsOfInterest} from './points-of-interest'
import {loadGrid} from './grid'

import type {LonLat} from '../types'

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
export function initialize (startCoordinate?: LonLat) {
  return fetch({
    url: 'config.json',
    next (response) {
      const config = response.value
      return loadDatasetFromJSON({...config, startCoordinate})
    }
  })
}

export function loadDatasetFromJSON (jsonConfig: any) {
  if (!jsonConfig.networks) window.alert('Invalid JSON config! A networks array is required.')
  if (window.localStorage) window.localStorage.setItem('taui-config', JSON.stringify(jsonConfig, null, '  '))
  return loadDataset(jsonConfig.networks, jsonConfig.grids, jsonConfig.pointsOfInterestUrl, jsonConfig.startCoordinate)
}

export function loadDataset (networks: {name: string, url: string},
  grids: {name: string, url: string, icon: string},
  pointsOfInterestUrl?: string,
  startCoordinate?: LonLat
) {
  return [
    setNetworksToEmpty(),
    loadPointsOfInterest(pointsOfInterestUrl),
    ...grids.map(grid => loadGrid(grid)),
    fetchMultiple({
      fetches: networks.map(network => ({
        url: `${network.url}/query.json`
      })),
      next: (responses) => {
        const actions = networks.map((network, index) =>
          setNetwork({
            ...network,
            query: {
              ...responses[index].value,
              west: 116121, // TODO remove defaults
              north: 51392,
              width: 639,
              height: 466
            }
          })
        )

        if (startCoordinate) actions.push(fetchDataForCoordinate(startCoordinate))
        // else TODO set map.centerCoordinates from the query.json

        return actions
      }
    })
  ]
}

export const fetchDataForCoordinate = (coordinate: LonLat) => (
  dispatch: Dispatch,
  getState: any
) => {
  const state = getState()
  const currentZoom = state.map.zoom
  dispatch(
    state.data.networks.map(network =>
      fetchDataForNetwork(network, coordinate, currentZoom)
    )
  )
}

const fetchDataForNetwork = (network, coordinate, currentZoom) => {
  const originPoint = coordinateToPoint(coordinate, currentZoom, network.query.zoom, network.query.west, network.query.north)
  const index = originPoint.x + originPoint.y * network.query.width
  return fetchMultiple({
    fetches: [
      {
        url: `${network.url}/${index}_times.dat`
      },
      {
        url: `${network.url}/${index}_paths.dat`
      }
    ],
    next: ([timesResponse, pathsResponse]) => {
      const travelTimeSurface = parseTimesData(timesResponse.value)
      const {paths, targets} = parsePathsData(pathsResponse.value)

      warnForInvalidPaths(paths, network.query.transitiveData)

      return setNetwork({
        ...network,
        originPoint,
        paths,
        targets,
        travelTimeSurface
      })
    }
  })
}
