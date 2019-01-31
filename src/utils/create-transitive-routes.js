import polyline from '@mapbox/polyline'
import find from 'lodash/find'
import flatten from 'lodash/flatten'
import slice from 'lodash/slice'
import uniqBy from 'lodash/uniqBy'
import toUpperCase from 'lodash/upperCase'

import {coordinateToIndex} from './coordinate-to-point'
import {isLight} from './hex-color-contrast'

const DEFAULT_ROUTE_COLOR = '0b2b40'
const TYPE_TO_ICON = ['subway', 'subway', 'train', 'bus']
const WALK = 'WALK'

export default function createTransitiveRoutesForNetwork (network, coordinates) {
  const td = network.transitive

  // Get the targetPathIndexes
  const coordinateIndex = coordinateToIndex(coordinates, network)
  const baseIndex = network.pathsPerTarget * coordinateIndex

  // Don't use native slice here as `targets` is a TypedArray and that will
  // force conversion to TypedArray values
  const targetPathIndexes = slice(
    network.targets,
    baseIndex,
    baseIndex + network.pathsPerTarget
  ).filter(tpi => tpi !== -1) // some destinations will not have any paths

  // Cannot reach the destination
  if (targetPathIndexes.length === 0) return []

  // Find stop
  const findStop = stopId => find(td.stops, ['stop_id', stopId])

  // Convert to [stop, pattern, stop] arrays
  const allPaths = targetPathIndexes.map(index => network.paths[index])

  // Filter out non-unique path combinations
  const uniquePaths = uniqBy(
    allPaths,
    (p) => flatten(p).join('-')
  )

  // Populate each path leg with it's stops, pattern, and route
  const populatePath = path => path.map(([fromStopId, patternId, toStopId]) => {
    const pattern = find(td.patterns, ['pattern_id', patternId])
    const route = find(td.routes, ['route_id', pattern.route_id])
    return {
      fromStop: findStop(fromStopId),
      pattern,
      route,
      toStop: findStop(toStopId)
    }
  })

  return uniquePaths.map(populatePath).map(addDataToPath)
}

/**
 * Used to show a transitive route
 */
function addDataToPath (path) {
  const segments = []
  let previousStop = path[0].fromStop
  for (let i = 0; i < path.length; i++) {
    const leg = path[i]
    const boardStop = leg.fromStop
    const pattern = leg.pattern
    const alightStop = leg.toStop

    // If there is an on-street transfer
    if (previousStop.stop_id !== boardStop.stop_id) {
      segments.push({
        mode: WALK,
        coordinates: [
          [previousStop.stop_lon, previousStop.stop_lat],
          [boardStop.stop_lon, boardStop.stop_lat]
        ]
      })
    }

    const findStopIndex = stop =>
      pattern.stops.findIndex(s => s.stop_id === stop.stop_id)

    const subSegments = pattern.stops.slice(
      findStopIndex(boardStop), findStopIndex(alightStop))
    const latLons = subSegments.reduce((lls, s) =>
      [...lls, ...polyline.decode(s.geometry)], [])

    /** TODO Patterns with more than one rout
    if (leg[1].patterns && leg[1].patterns.length > 0) {
      const patternNames = leg[1].patterns
        .map(p => fot(td.routes, r => r.route_id === p.route_id))
        .map(getRouteName)
      seg.name = uniq(patternNames).join(' / ')
    } */

    segments.push({
      fromStop: {
        coordinates: [boardStop.stop_lon, boardStop.stop_lat],
        name: boardStop.stop_name,
        stopId: boardStop.stop_id
      },
      coordinates: latLons.map(([lat, lon]) => [lon, lat]), // reverse coords
      mode: TYPE_TO_ICON[leg.route.route_type],
      name: toUpperCase(leg.route.route_short_name),
      patternId: leg.pattern.pattern_id,
      routeColor: '#' + (leg.route.route_color || DEFAULT_ROUTE_COLOR),
      routeId: leg.route.route_id,
      toStop: {
        coordinates: [alightStop.stop_lon, alightStop.stop_lat],
        name: alightStop.stop_name,
        stopId: alightStop.stop_id
      }
    })

    previousStop = alightStop
  }

  return segments
}
