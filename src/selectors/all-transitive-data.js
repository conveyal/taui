// @flow
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import {createSelector} from 'reselect'

import selectEndIndexes from './end-indexes'
import getRouteSegmentsFromJourney from '../utils/get-route-segments-from-journey'

type PathDescriptor = [number, number, number] // [boardStopId, patternId, alightStopId]
type Stop = {
  stop_id: string,
  geometry: string
}
type Pattern = {
  pattern_id: string,
  pattern_name: string,
  route_id: string,
  stops: Stop[]
}

const PLACE = 'PLACE'
const STOP = 'STOP'
const TRANSIT = 'TRANSIT'
const WALK = 'WALK'

export default createSelector(
  state => get(state, 'data.networks'),
  state => get(state, 'geocoder.start'),
  state => get(state, 'geocoder.end'),
  selectEndIndexes,
  (networks, start, end, endIndexes) =>
    networks.map((network, nIndex) => {
      const td = get(network, 'query.transitiveData')
      if (start && start.position && end && end.position && network.paths && network.targets && td.patterns) {
        const places = [{
          place_id: 'from',
          place_name: start.label,
          place_lon: start.position.lon,
          place_lat: start.position.lat
        }, {
          place_id: 'to',
          place_name: end.label,
          place_lon: end.position.lon,
          place_lat: end.position.lat
        }]

        const targetIndex = endIndexes[nIndex]
        const targetPathIndexes = uniq(network.targets[targetIndex])
        const paths = targetPathIndexes.map(i => network.paths[i])
        const journeys = getJourneys(paths, td.patterns)

        return {
          ...td,
          journeys,
          places,
          routeSegments: journeys.map(j => getRouteSegmentsFromJourney(j, td.patterns, td.routes))
        }
      } else {
        return td
      }
    })
)

function getJourneys (paths, patterns) {
  return paths.map((path, pidx) => {
    return {
      journey_id: pidx,
      journey_name: pidx,
      segments: path.length === 0
        ? createWalkOnlyJourney()
        : getSegmentsFromPath(path, patterns)
    }
  })
}

function createWalkOnlyJourney () {
  return [{
    type: WALK,
    from: {
      type: PLACE,
      place_id: 'from'
    },
    to: {
      type: PLACE,
      place_id: 'to'
    }
  }]
}

function getSegmentsFromPath (path: PathDescriptor[], patterns: Pattern[]) {
  const initialStopId = `${path[0][0]}`
  const segments = []
  let previousStopId = initialStopId
  for (let i = 0; i < path.length; i++) {
    const leg = path[i]
    const boardStopId = `${leg[0]}`
    const patternId = `${leg[1]}`
    const alightStopId = `${leg[2]}`
    const pattern = patterns.find(p => p.pattern_id === patternId)

    if (!pattern) {
      throw new Error(`Pattern ${patternId} was not found in the transitive data.`)
    }

    const boardStopIndex = pattern.stops.findIndex(stop => stop.stop_id === boardStopId)
    const alightStopIndex = pattern.stops.findIndex(stop => stop.stop_id === alightStopId)

    if (boardStopIndex === -1) {
      throw new Error(`Stop ${boardStopId} could not be found in pattern ${patternId}.`)
    } else if (alightStopIndex === -1) {
      throw new Error(`Stop ${alightStopId} could not be found in pattern ${patternId}.`)
    }

    if (previousStopId !== boardStopId) {
      // aka there is an on-street transfer
      segments.push({
        type: WALK,
        from: {
          type: STOP,
          stop_id: previousStopId
        },
        to: {
          type: STOP,
          stop_id: boardStopId
        }
      })
    }

    segments.push({
      type: TRANSIT,
      pattern_id: patternId,
      from_stop_index: boardStopIndex,
      to_stop_index: alightStopIndex
    })

    previousStopId = alightStopId
  }

  return [{
    type: WALK,
    from: {
      type: PLACE,
      place_id: 'from'
    },
    to: {
      type: STOP,
      stop_id: initialStopId
    }
  }, ...segments, {
    type: WALK,
    from: {
      type: STOP,
      stop_id: previousStopId
    },
    to: {
      type: PLACE,
      place_id: 'to'
    }
  }]
}
