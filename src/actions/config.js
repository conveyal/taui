// @flow
import lonlat from '@conveyal/lonlat'
import {fetchMultiple} from '@conveyal/woonerf/fetch'
import get from 'lodash/get'

import {retrieveConfig, storeConfig} from '../config'
import cacheURL from '../utils/cache-url'
import {pointToCoordinate} from '../utils/coordinate-to-point'

import {loadGrid} from './grid'
import {updateStartPosition} from './location'
import {addActionLogItem as logItem} from './log'
import {updateMap} from './map'
import {setNetwork} from './network'
import {loadPointsOfInterest} from './points-of-interest'

/**
 * Download the initial set of data and set the state accordingly. First, check
 * and parse the query parameters. If there is a `start`, set the networks to
 * loading. Second, load the grids. Third, gecode the starting parameters
 */
export const initialize = (startCoordinate?: any) => (dispatch, getState) => {
  const state = getState()
  if (state.ui.allowChangeConfig) {
    try {
      const json = retrieveConfig()
      if (json && json.networks) {
        return dispatch(loadDataset(
          json.networks,
          json.grids,
          json.pointsOfInterestUrl,
          startCoordinate || json.startCoordinate,
          json.map
        ))
      }
    } catch (e) {
      console.log('Error parsing taui-config', e)
    }
  }

  dispatch(loadDataset(
    state.data.networks,
    state.data.grids,
    state.data.pointsOfInterestUrl,
    startCoordinate,
    state.map
  ))
}

export function loadDatasetFromJSON (jsonConfig: any) {
  storeConfig(jsonConfig)
  return loadDataset(
    jsonConfig.networks,
    jsonConfig.grids,
    jsonConfig.pointsOfInterestUrl,
    jsonConfig.startCoordinate,
    jsonConfig.map
  )
}

export const loadDataset = (
  networks: {name: string, showOnMap: boolean, url: string},
  grids: {icon: string, name: string, showOnMap: boolean, url: string},
  pointsOfInterestUrl?: string,
  startCoordinate?: any,
  map?: {maxBounds?: number[][], maxZoom?: number, minZoom?: number}
) => (dispatch: Dispatch, getState: any) => {
  dispatch({type: 'clear data'})

  // Try to load points of interest
  if (pointsOfInterestUrl) dispatch(loadPointsOfInterest(pointsOfInterestUrl))

  // Update map
  if (map) dispatch(updateMap(map))

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

      try {
      // Load the config start coordinate or the center
        const centerFromMap = get(map, 'centerCoordinates') !== undefined
          ? lonlat.fromLeaflet(map.centerCoordinates)
          : getCenterFromNetwork(fullNetworks[0])
        const centerCoordinates = startCoordinate || centerFromMap

        const geocoder = {
          proximity: lonlat.toString(centerFromMap)
        }
        const maxBounds = get(map, 'maxBounds')
        if (maxBounds) {
          geocoder.bbox = typeof maxBounds === 'string'
            ? maxBounds
            : `${maxBounds[0].join(',')},${maxBounds[1].join(',')}`
        }

        dispatch({type: 'set geocoder', payload: geocoder})
        dispatch(updateStartPosition(centerCoordinates))
      } catch (e) {
        console.error(e)
      }
    }
  }))
}

function getCenterFromNetwork (network) {
  const x = network.west + network.width / 2
  const y = network.north + network.height / 2
  const c = pointToCoordinate(x, y, network.zoom)
  return c
}
