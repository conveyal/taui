import cacheURL from '../utils/cache-url'
import coordinateToPoint from '../utils/coordinate-to-point'
import fetch from '../utils/fetch'
import {parsePathsData} from '../utils/parse-paths-data'
import {parseTimesData} from '../utils/parse-times-data'

export function coordinateToIndex(network, coordinate) {
  const originPoint = coordinateToPoint(
    coordinate,
    network.zoom,
    network.west,
    network.north
  )
  return originPoint.x + originPoint.y * network.width
}

export function fetchTimesAtIndex(url, index) {
  return fetch(cacheURL(`${url}/${index}_times.dat`))
    .then(response => response.arrayBuffer())
    .then(parseTimesData)
}

export function fetchPathsAtIndex(url, index) {
  return fetch(cacheURL(`${url}/${index}_paths.dat`))
    .then(response => response.arrayBuffer())
    .then(parsePathsData)
}
