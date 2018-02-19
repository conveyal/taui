// @flow
import Color from 'color'
import toCapitalCase from 'lodash/capitalize'
import uniq from 'lodash/uniq'

import {coordinateToIndex} from './coordinate-to-point'

import type {
  TransitiveStop,
  Location,
  QualifiedLeg,
  QualifiedPath
} from '../types'

type Network = {
  query: any,
  targets: any[],
  paths: any[]
}

/**
 * Find or throw
 */
function fot (a, find) {
  const ret = a.find(find)
  if (!ret) throw new Error('Value not found in array.')
  return ret
}

const MAX_DISSIMILARITY = 5e-6
const TYPE_TO_ICON = ['subway', 'subway', 'train', 'bus']
const PLACE = 'PLACE'
const STOP = 'STOP'
const TRANSIT = 'TRANSIT'
const WALK = 'WALK'

export default function createTransitiveRoutesForNetwork (
  network: Network,
  start: Location,
  end: Location,
  zoom: number
) {
  const td = network.query.transitiveData
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

  // Get the set of unique path indexes for a start/end pair
  const targetPathIndexes = uniq(
    network.targets[coordinateToIndex(end.position, zoom, network.query)]
  )
  const paths = targetPathIndexes
    // map the pathIndex to the actual path sequence
    .map(i => network.paths[i])
    // map the pattern ids in each path leg to the actual patterns they contain
    .map(path =>
      path.map(leg => [
        leg[0],
        fot(td.patterns, p => p.pattern_id === leg[1]), // ensure that we are comparing strings
        leg[2]
      ])
    )
    // map the stop ids to actual stops including their stop index
    .map(path =>
      path.map(([boardStopId, pattern, alightStopId]) => {
        const findStop = id => ({
          ...fot(td.stops, s => s.stop_id === id),
          stopIndex: pattern.stops.findIndex(s => s.stop_id === id)
        })

        return [findStop(boardStopId), pattern, findStop(alightStopId)]
      })
    )

  console.log('Path count before finding common paths', paths.length)
  const uniqueRouteSequences = new Set()
  const commonPaths = paths.filter(path => {
    const routeSeq = path.map(leg => leg[1].route_id).join('-')
    if (uniqueRouteSequences.has(routeSeq)) return false
    uniqueRouteSequences.add(routeSeq)
    return true
  })

  // Cluster paths based on a similarity score
  console.log('Path count before clustering', commonPaths.length)
  const clusteredPaths = clusterPaths(commonPaths)
  console.log('Path count after clustering', clusteredPaths.length)

  // Map the paths to transitive journeys
  const journeys = clusteredPaths.map((path, pidx) => ({
    journey_id: pidx,
    journey_name: pidx,
    segments: path.length === 0
      ? createWalkOnlyJourney()
      : getTransitiveSegmentsFromPath(path)
  }))

  return {
    ...td,
    journeys,
    places,
    routeSegments: clusteredPaths.map(path =>
      path.map(leg => {
        const route = fot(td.routes, r => r.route_id === leg[1].route_id)
        const seg = {}
        const color = route.route_color
          ? Color(`#${route.route_color}`)
          : Color('#0b2b40')
        seg.name = toCapitalCase(route.route_short_name)

        if (leg[1].patterns && leg[1].patterns.length > 0) {
          const patternNames = leg[1].patterns
            .map(p => fot(td.routes, r => r.route_id === p.route_id))
            .map(r => toCapitalCase(r.route_short_name))
          seg.name = uniq(patternNames).join(' / ')
        }

        seg.backgroundColor = color.string()
        seg.color = color.light() ? '#000' : '#fff'
        seg.type = TYPE_TO_ICON[route.route_type]

        return seg
      })
    )
  }
}

/**
 * Bundle similar journeys in transitive data together. Works by computing a
 * score for each segment based on where the endpoints are relative to each
 * other. It might also make sense to use a metric based on speed so that a very
 * slow bus isn't bundled with a fast train, but we don't currently do this.
 */
function clusterPaths (paths: QualifiedPath[]): QualifiedPath[] {
  // a cluster is an array of paths, initially each path is it's own cluster
  const clusters = paths.map(p => [p])

  // prevent infinite loop, makes sense only to loop until there's just one cluster left
  while (clusters.length > 1) {
    // find the minimum dissimilarity
    let minDis = Infinity
    let minI = 0
    let minJ = 0

    for (let i = 1; i < clusters.length; i++) {
      for (let j = 0; j < i; j++) {
        const d = getClusterDissimilarity(clusters[i], clusters[j])

        if (d < minDis) {
          minDis = d
          minI = i
          minJ = j
        }
      }
    }

    // Remaining clusters are too unique to combine further.
    if (minDis > MAX_DISSIMILARITY) break

    // cluster the least dissimilar clusters
    clusters[minI] = clusters[minI].concat(clusters[minJ])
    clusters.splice(minJ, 1) // remove clusters[j]
  }

  return clusters.map(c =>
    c.reduce((p1, p2) =>
      p1.map((leg, legIndex) => {
        if (!leg[1].patterns) {
          leg[1].patterns = [leg[1]]
        }

        // clustered paths are guaranteed to be the same length
        leg[1].patterns.push(p2[legIndex][1])

        return leg
      })
    )
  )
}

/**
 * How similar are the paths in each of these clusters?
 */
function getClusterDissimilarity (
  c1: QualifiedPath[],
  c2: QualifiedPath[]
): number {
  let dissimilarity = 0

  for (const p1 of c1) {
    for (const p2 of c2) {
      // Don't cluster if they aren't the same length.
      if (p1.length !== p2.length) return Infinity

      for (let i = 0; i < p1.length; i++) {
        dissimilarity = Math.max(dissimilarity, legDissimilarity(p1[i], p2[i]))

        // no point in continuing, these won't be merged
        if (dissimilarity > MAX_DISSIMILARITY) return Infinity
      }
    }
  }

  return dissimilarity
}

/**
 * Find the distances between each legs starting stops and each legs ending
 * stops and return the max.
 */
function legDissimilarity (l1: QualifiedLeg, l2: QualifiedLeg): number {
  return Math.max(stopDistance(l1[0], l2[0]), stopDistance(l1[2], l2[2]))
}

/**
 * Get the Ersatz (squared) distance between two stops, in undefined units
 */
function stopDistance (s1: TransitiveStop, s2: TransitiveStop): number {
  const cosLat = Math.cos(s1.stop_lat * Math.PI / 180)
  return (
    Math.pow(s1.stop_lat - s2.stop_lat, 2) +
    Math.pow(s1.stop_lon * cosLat - s2.stop_lon * cosLat, 2)
  )
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
