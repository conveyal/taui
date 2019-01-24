import cacheURL from '../utils/cache-url'
import coordinateToPoint from '../utils/coordinate-to-point'
import fetch from '../utils/fetch'
import {parsePathsData} from '../utils/parse-paths-data'
import {parseTimesData} from '../utils/parse-times-data'

export function fetchDataAtCoordinate (network, coordinate) {
  const index = coordinateToIndex(network, coordinate)
  return fetchDataAtIndex(network, index)
}

function coordinateToIndex (network, coordinate) {
  const originPoint = coordinateToPoint(
    coordinate,
    network.zoom,
    network.west,
    network.north
  )
  return originPoint.x + originPoint.y * network.width
}

/**
 * Fetch all of the network data associated with a specific index.
 */
function fetchDataAtIndex (network, index) {
  return Promise.all([
    fetchTimesAtIndex(network, index),
    fetchPathsAtIndex(network, index)
  ])
}

export function fetchTimesAtIndex (network, index) {
  return fetch(cacheURL(`${network.url}/${index}_times.dat`))
    .then(response => response.arrayBuffer())
    .then(parseTimesData)
}

export function fetchPathsAtIndex (network, index) {
  return fetch(cacheURL(`${network.url}/${index}_paths.dat`))
    .then(response => response.arrayBuffer())
    .then(parsePathsData)
}
