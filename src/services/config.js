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
export default async function config (initialState = {}) {
  const data = {}

  // Create all of the fetches to run in parallel
  const fetches = []

  // Try to load points of interest
  if (initialState.poiUrl) {
    fetches.push(loadPointsOfInterest(initialState.poiUrl)
      .then(poi => {
        data.poi = poi
      }))
  }

  // Load all opportunity grids
  get(initialState, 'grids', []).forEach((grid, i) => {
    fetches.push(loadGrid(grid).then(fullGrid => {
      set(data, ['grids', i], fullGrid)
    }))
  })

  get(initialState, 'networks', []).forEach((network, i) => {
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

      // Only load the center from the first network if a center is not set
      if (i > 0 || get(initialState, 'map.center')) return

      try {
        const centerFromNetwork = getCenterFromNetwork(request)
        set(data, 'map.center', centerFromNetwork)
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
