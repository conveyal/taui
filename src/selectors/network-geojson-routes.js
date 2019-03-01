import {createSelector} from 'reselect'

import selectNetworkRoutes from './network-routes'

const WALK = 'WALK'

/**
 * Return a FeatureCollection of LineStrings and Points representing lines and
 * stops.
 */
export default createSelector(
  state => state.activeNetwork,
  state => state.networks,
  state => state.start,
  state => state.end,
  selectNetworkRoutes, // if journeys exist, so does the network, start + end
  (activeNetwork, networks, start, end, networkRoutes) => networks.map((network, i) =>
    networkRoutes[i].map(segments => {
      if (typeof activeNetwork === 'string' && activeNetwork !== network.name) {
        return {type: 'FeatureCollection', features: []}
      }

      // Convert to [lon, lat] coordinates
      const startCoords = [start.position.lon, start.position.lat]
      const endCoords = [end.position.lon, end.position.lat]

      if (segments.length === 0) {
        return {
          type: 'FeatureCollection',
          features: [createWalkFeature([startCoords, endCoords])]
        }
      }

      const firstStop = segments[0].fromStop
      const lastStop = segments[segments.length - 1].toStop

      return {
        type: 'FeatureCollection',
        features: [
          createWalkFeature([startCoords, firstStop.coordinates]),
          ...segments.reduce((features, s) =>
            [...features, ...createSegmentFeatures(s)]
          , []),
          createWalkFeature([lastStop.coordinates, endCoords])
        ]
      }
    })
  )
)

function createSegmentFeatures (segment) {
  if (segment.mode === WALK) {
    return [createWalkFeature(segment.coordinates)]
  }

  return [
    createStopFeature(segment.fromStop), {
      type: 'Feature',
      properties: {
        mode: segment.mode,
        name: segment.name,
        patternId: segment.patternId,
        routeColor: segment.routeColor,
        routeId: segment.routeId
      },
      geometry: {
        type: 'LineString',
        coordinates: segment.coordinates
      }
    },
    createStopFeature(segment.toStop)
  ]
}

function createStopFeature (stop) {
  return {
    type: 'Feature',
    properties: {
      name: stop.name,
      stopId: stop.stopId
    },
    geometry: {
      type: 'Point',
      coordinates: stop.coordinates
    }
  }
}

function createWalkFeature (coordinates) {
  return {
    type: 'Feature',
    properties: {
      mode: WALK
    },
    geometry: {
      type: 'LineString',
      coordinates
    }
  }
}
