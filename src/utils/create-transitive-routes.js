// @flow
import slice from 'lodash/slice'
import uniq from 'lodash/uniq'
import toUpperCase from 'lodash/upperCase'

import type {Location, Path, QualifiedPath} from '../types'

import {coordinateToIndex} from './coordinate-to-point'
import {isLight} from './hex-color-contrast'

type Network = {
  paths: Path[],
  targets: number[]
}

/**
 * Find or throw
 */
function fot (a, find) {
  const ret = a.find(find)
  if (!ret) throw new Error('Value not found in array.')
  return ret
}

const TYPE_TO_ICON = ['subway', 'subway', 'train', 'bus']
const PLACE = 'PLACE'
const STOP = 'STOP'
const TRANSIT = 'TRANSIT'
const WALK = 'WALK'

export default function createTransitiveRoutesForNetwork (
  network: Network,
  start: Location,
  end: Location
) {
  const td = network.transitive
  const places = [
    {
      place_id: 'from',
      place_name: start.label,
      place_lon: start.position.lon,
      place_lat: start.position.lat
    },
    {
      place_id: 'to',
      place_name: end.label,
      place_lon: end.position.lon,
      place_lat: end.position.lat
    }
  ]

  // Get the targetPathIndexes
  const baseIndex = network.pathsPerTarget * coordinateToIndex(end.position, network)

  // Don't use native slice here as `targets` is a TypedArray and that will force conversion to TypedArray values
  const targetPathIndexes = uniq(slice(
    network.targets,
    baseIndex,
    baseIndex + network.pathsPerTarget
  )).filter(tpi => tpi !== -1) // some destinations will not have any paths

  // Cannot reach the destination
  if (targetPathIndexes.length === 0) {
    return {
      ...td,
      places,
      journeys: [],
      routeSegments: []
    }
  }

  const paths = targetPathIndexes.map(tpi => network.paths[tpi]
    // map the pattern ids in each path leg to the actual patterns they contain
    .map(leg => [
      leg[0],
      fot(td.patterns, p => p.pattern_id === leg[1]), // ensure that we are comparing strings
      leg[2]
    ])
    // map the stop ids to actual stops including their stop index
    .map(([boardStopId, pattern, alightStopId]) => {
      const findStop = id => ({
        ...fot(td.stops, s => s.stop_id === id),
        stopIndex: pattern.stops.findIndex(s => s.stop_id === id)
      })

      return [findStop(boardStopId), pattern, findStop(alightStopId)]
    }))

  // Map the paths to transitive journeys
  const journeys = paths.map(path => ({
    journey_id: 0,
    journey_name: 0,
    segments: path.length === 0
      ? createWalkOnlyJourney()
      : getTransitiveSegmentsFromPath(path)
  }))

  return {
    ...td,
    journeys,
    places,
    routeSegments: paths.map(path => path.map(leg => {
      const route = fot(td.routes, r => r.route_id === leg[1].route_id)
      const seg = {}
      const getRouteName = r =>
        toUpperCase(route.route_short_name)
      const color = route.route_color
        ? `#${route.route_color}`
        : '#0b2b40'
      seg.name = getRouteName(route)

      if (leg[1].patterns && leg[1].patterns.length > 0) {
        const patternNames = leg[1].patterns
          .map(p => fot(td.routes, r => r.route_id === p.route_id))
          .map(getRouteName)
        seg.name = uniq(patternNames).join(' / ')
      }

      seg.backgroundColor = color
      seg.color = isLight(color.substr(1)) ? '#000' : '#fff'
      seg.type = TYPE_TO_ICON[route.route_type]

      return seg
    }))
  }
}

function createWalkOnlyJourney () {
  return [
    {
      type: WALK,
      from: {
        type: PLACE,
        place_id: 'from'
      },
      to: {
        type: PLACE,
        place_id: 'to'
      }
    }
  ]
}

/**
 * Used to show a transitive route
 */
function getTransitiveSegmentsFromPath (path: QualifiedPath) {
  const initialStopId = path[0][0].stop_id
  const segments = []
  let previousStopId = initialStopId
  for (let i = 0; i < path.length; i++) {
    const leg = path[i]
    const boardStop = leg[0]
    const pattern = leg[1]
    const alightStop = leg[2]

    if (previousStopId !== boardStop.stop_id) {
      // aka there is an on-street transfer
      segments.push({
        type: WALK,
        from: {
          type: STOP,
          stop_id: previousStopId
        },
        to: {
          type: STOP,
          stop_id: boardStop.stop_id
        }
      })
    }

    segments.push({
      type: TRANSIT,
      pattern_id: pattern.pattern_id,
      from_stop_index: boardStop.stopIndex,
      to_stop_index: alightStop.stopIndex
    })

    previousStopId = alightStop.stop_id
  }

  return [
    {
      type: WALK,
      from: {
        type: PLACE,
        place_id: 'from'
      },
      to: {
        type: STOP,
        stop_id: initialStopId
      }
    },
    ...segments,
    {
      type: WALK,
      from: {
        type: STOP,
        stop_id: previousStopId
      },
      to: {
        type: PLACE,
        place_id: 'to'
      }
    }
  ]
}
