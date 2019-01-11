import lonlat from '@conveyal/lonlat'
import get from 'lodash/get'
import set from 'lodash/set'

import cacheURL from '../utils/cache-url'
import {pointToCoordinate} from '../utils/coordinate-to-point'
import fetch from '../utils/fetch'

import {loadGrid} from './grid'
import {loadPointsOfInterest} from './points-of-interest'

/**
 * Download the initial set of data and set the state accordingly. First, check
 * and parse the query parameters. If there is a `start`, set the networks to
 * loading. Second, load the grids. Third, gecode the starting parameters
 */
export default async function config (qs = {}, customConfig = {}, initialState = {}) {
  const data = {
    end: get(customConfig, 'end'),
    start: get(customConfig, 'start')
  }

  if (qs.zoom) {
    set(data, 'map.zoom', parseInt(qs.zoom, 10))
  }

  // Handle errors in parsing coordinates
  try {
    if (qs.startCoordinate) {
      data.start = {
        label: qs.start,
        position: lonlat.fromString(qs.startCoordinate)
      }
    }

    if (qs.endCoordinate) {
      data.end = {
        label: qs.end,
        position: lonlat.fromString(qs.endCoordinate)
      }
    }
  } catch (e) {
    console.error(e)
  }

  // Load the rest of the data from initial state or the custom saved config
  const allowChangeConfig = get(initialState, 'ui.allowChangeConfig')
  const configData = allowChangeConfig && customConfig && customConfig.networks
    ? customConfig
    : {...initialState, ...initialState.data}

  // Set the geocoder bounding box from the map
  const maxBounds = get(configData, 'map.maxBounds')
  if (maxBounds) {
    const bbox = typeof maxBounds === 'string'
      ? maxBounds
      : `${maxBounds[0].join(',')},${maxBounds[1].join(',')}`
    set(data, 'geocoder.bbox', bbox)
  }

  // Create all of the fetches to run in parallel
  const fetches = []

  // Try to load points of interest
  if (configData.poiUrl) {
    fetches.push(loadPointsOfInterest(configData.poiUrl)
      .then(poi => {
        data.poi = poi
      }))
  }

  // Load all opportunity grids
  get(configData, 'grids', []).forEach((grid, i) => {
    fetches.push(loadGrid(grid).then(fullGrid => {
      set(data, ['grids', i], fullGrid)
    }))
  })

  get(configData, 'networks', []).forEach((network, i) => {
    console.log(network)

    fetches.push(fetchTransitive(network).then(transitive =>
      set(data, ['networks', i, 'transitive'], transitive)
    ))

    fetches.push(fetchRequest(network).then(r => {
      // TODO remove when request data is moved to the top level.
      const request = get(r, 'request', r)
      const transitive = get(data, ['networks', i, 'transitive'])
      set(data, ['networks', i], {
        ...network,
        ...request,
        ready: true,
        transitive
      })

      // Only load the center from the first network
      if (i > 0) return

      try {
        const centerFromNetwork = getCenterFromNetwork(request)
        const centerCoordinates =
          get(configData, 'map.centerCoordinates', centerFromNetwork)

        set(data, 'map.centerCoordinates', centerCoordinates)
        set(data, 'geocoder.proximity', lonlat.toString(centerCoordinates))
      } catch (e) {
        console.error(e)
      }
    }))
  })

  // Run all of the fetches
  await Promise.all(fetches)

  return data
}

function fetchTransitive (network) {
  return fetch(cacheURL(`${network.url}/transitive.json`))
    .then(res => res.json())
}

function fetchRequest (network) {
  return fetch(cacheURL(`${network.url}/request.json`))
    .then(res => res.json())
}

function getCenterFromNetwork (network) {
  const x = network.west + network.width / 2
  const y = network.north + network.height / 2
  const c = pointToCoordinate(x, y, network.zoom)
  return c
}
