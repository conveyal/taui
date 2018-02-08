// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

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
  state => get(state, 'data.origins'),
  state => get(state, 'geocoder.start'),
  state => get(state, 'geocoder.end'),
  state => get(state, 'map.zoom'),
  (origins, start, end, zoom) =>
    origins.map(origin => {
      const patterns = get(origin, 'query.transitiveData.patterns')
      if (start && start.position && end && end.position && origin.pathLists && patterns) {
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

        const journeys = getJourneys(origin.pathLists, patterns)

        return {
          ...origin.query.transitiveData,
          journeys,
          places
        }
      }
    })
)

function getJourneys (pathLists, patterns) {
  return pathLists.map((pathList, pidx) => {
    return {
      journey_id: pidx,
      journey_name: pidx,
      segments: pathList.length === 0
        ? createWalkOnlyJourney()
        : getSegmentsFromPathList(pathList, patterns)
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

function getSegmentsFromPathList (pathList: PathDescriptor[], patterns: Pattern[]) {
  const originStopId = `${pathList[0][0]}`
  const segments = []
  let previousStopId = originStopId
  for (let i = 0; i < pathList.length; i++) {
    const pathD = pathList[i]
    const boardStopId = `${pathD[0]}`
    const patternId = `${pathD[1]}`
    const alightStopId = `${pathD[2]}`
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
      stop_id: originStopId
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

/* TODO: filter journeys that have same pattern id sequences
const extractRelevantTransitiveInfo = ({journeys, patterns, routes, stops}) =>
  journeys.map(j =>
    j.segments.filter(s => !!s.pattern_id || !!s.patterns).map(s => {
      const pid = s.pattern_id || s.patterns[0].pattern_id
      const seg = {}
      const route = findRouteForPattern({id: pid, patterns, routes})
      const color = route.route_color
        ? Color(`#${route.route_color}`)
        : Color('#0b2b40')
      seg.name = toCapitalCase(route.route_short_name)

      if (s.patterns && s.patterns.length > 0) {
        const patternNames = s.patterns.map(p =>
          toCapitalCase(
            findRouteForPattern({id: p.pattern_id, patterns, routes})
              .route_short_name
          )
        )
        seg.name = unique(patternNames).join(' / ')
      }

      seg.backgroundColor = color.string()
      seg.color = color.light() ? '#000' : '#fff'
      seg.type = typeToIcon[route.route_type]

      return seg
    })
  )

const findRouteForPattern = ({id, patterns, routes}) =>
  routes.find(
    r => r.route_id === patterns.find(p => p.pattern_id === id).route_id
  )

const typeToIcon = ['subway', 'subway', 'train', 'bus']
*/
