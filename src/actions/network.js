// @flow
import {fetchMultiple} from '@conveyal/woonerf/fetch'

import {ACCESSIBILITY_IS_LOADING, ACCESSIBILITY_IS_EMPTY} from '../constants'
import coordinateToPoint from '../utils/coordinate-to-point'
import {parsePathsData, warnForInvalidPaths} from '../utils/parse-paths-data'
import {parseTimesData} from '../utils/parse-times-data'

import {loadGrid} from './grid'

import type {LonLat} from '../types'

export const setNetwork = (payload: any) =>
  ({type: 'set network', payload})
export const setActiveNetwork = (payload: string) =>
  ({type: 'set active network', payload})
export const setNetworksAccessibilityTo = (value: string) =>
  (dispatch: Dispatch, getState: any) => {
    const state = getState()
    dispatch(state.data.networks.map(network => setNetwork({
      ...network,
      accessibility: value
    })))
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
export function initialize (done: (any) => void) {
  return (dispatch: Dispatch, getState: any) => {
    const state = getState()
    const networks = state.data.networks

    dispatch(setNetworksToEmpty())

    state.data.grids.map((grid) => {
      dispatch(loadGrid(grid.name, state.data.gridsUrl))
    })

    // load and set the queries
    dispatch(fetchMultiple({
      fetches: networks.map(network => ({
        url: `${network.url}/query.json`
      })),
      next (responses) {
        dispatch(networks.map((network, index) => setNetwork({
          ...network,
          query: {
            ...(responses[index].value),
            west: 20865, // TODO remove defaults
            north: 46876,
            width: 14,
            height: 9
          }
        })))

        done()
      }
    }))
  }
}

export const fetchDataForCoordinate = (coordinate: LonLat) =>
  (dispatch: Dispatch, getState: any) => {
    const state = getState()
    const currentZoom = state.map.zoom
    dispatch(state.data.networks.map(network =>
      fetchDataForNetwork(network, coordinate, currentZoom)))
  }

const fetchDataForNetwork = (network, coordinate, currentZoom) => {
  const originPoint = coordinateToPoint(coordinate, currentZoom, network.query)
  const index = originPoint.x + originPoint.y * network.query.width
  return fetchMultiple({
    fetches: [{
      url: `${network.url}/${index}_times.dat`
    }, {
      url: `${network.url}/${index}_paths.dat`
    }],
    next: ([timesResponse, pathsResponse]) => {
      const travelTimeSurface = parseTimesData(timesResponse.value)
      const nTargets = travelTimeSurface.width * travelTimeSurface.height
      const {paths, targets} = parsePathsData(pathsResponse.value, nTargets, 120)

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
