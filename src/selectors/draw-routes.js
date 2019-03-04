import polyline from '@mapbox/polyline'
import get from 'lodash/get'
import pullAt from 'lodash/pullAt'
import {createSelector} from 'reselect'

import {STOP_STYLE, TRANSIT_STYLE, WALK_STYLE} from '../constants'

import selectActiveNetworkIndex from './active-network-index'
import selectAllTransitiveData from './all-transitive-data'

const INACTIVE_OPACITY = 0.5

/**
 * NB: All positions are [latitude, longitude] as they go directly to Leaflet
 */
export default createSelector(
  state => get(state, 'data.networks', []),
  selectActiveNetworkIndex,
  selectAllTransitiveData,
  (networks, activeNetworkIndex, td = []) => {
    const drawRoutes = td.map((transitive, index) => {
      const applyStyle = index === activeNetworkIndex
        ? {opacity: 1}
        : {opacity: INACTIVE_OPACITY}
      const walkStyle = {...WALK_STYLE, ...applyStyle}
      const transitStyle = {...TRANSIT_STYLE, ...applyStyle}
      const stopStyle = {...STOP_STYLE, ...applyStyle}

      const segments = get(transitive, 'journeys[0].segments', [])
      return {
        index,
        label: networks[index].name,
        segments: segments.map(s => getSegmentPositions(s, transitive)),
        stops: segments
          .filter(s => s.type === 'TRANSIT')
          .reduce((stops, s, i) => [
            ...stops,
            getStopPositions(s.pattern_id, s.from_stop_index, transitive),
            getStopPositions(s.pattern_id, s.to_stop_index, transitive)
          ], []),
        stopStyle,
        transitStyle,
        walkStyle
      }
    })

    // Put the active network first
    return [pullAt(drawRoutes, activeNetworkIndex)[0], ...drawRoutes]
  }
)

function getSegmentPositions (segment, transitive) {
  if (segment.type === 'WALK') return getWalkPositions(segment, transitive)
  return getTransitPositions(segment, transitive)
}

function getWalkPositions (segment, transitive) {
  function ll (l) {
    if (l.place_id) {
      const p = transitive.places.find(p => p.place_id === l.place_id)
      return [p.place_lat, p.place_lon]
    }
    const s = transitive.stops.find(s => s.stop_id === l.stop_id)
    return [s.stop_lat, s.stop_lon]
  }
  return {
    type: 'WALK',
    positions: [ll(segment.from), ll(segment.to)]
  }
}

function getTransitPositions (segment, transitive) {
  const p = transitive.patterns.find(p => segment.pattern_id === p.pattern_id)
  const stops = p.stops.slice(segment.from_stop_index, segment.to_stop_index)
  const route = transitive.routes.find(r => p.route_id === r.route_id)
  const routeColor = get(route, 'route_color') // could be null
  return {
    color: `#${routeColor || '333'}`,
    type: 'TRANSIT',
    positions: stops.reduce((lls, s) =>
      [...lls, ...polyline.decode(s.geometry)], [])
  }
}

function getStopPositions (pid, sindex, transitive) {
  const p = transitive.patterns.find(p => pid === p.pattern_id)
  const sid = p.stops[sindex].stop_id
  const stop = transitive.stops.find(s => sid === s.stop_id)
  return [stop.stop_lat, stop.stop_lon]
}
