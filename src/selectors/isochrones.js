// @flow
import jsolines from 'jsolines'
import {Map as LeafletMap} from 'leaflet'
import get from 'lodash/get'
import {createSelector} from 'reselect'

import {NETWORK_COLORS} from '../constants'

const getIsochroneStyleFor = (index) => ({
  fillColor: NETWORK_COLORS[index],
  fillOpacity: index === 0 ? 0.6 : 0.4,
  pointerEvents: 'none',
  color: NETWORK_COLORS[index],
  weight: 0
})

export default createSelector(
  state => get(state, 'data.networks'),
  state => get(state, 'timeCutoff.selected'),
  (networks = [], timeCutoff) =>
    networks.map((n, i) => {
      if (n.showOnMap && n.travelTimeSurface && n.travelTimeSurface.data) {
        return getIsochrone(n, i, timeCutoff)
      }
    })
)

/**
 * Inputs to key for memoization
 */
function toKey (n, i, c) {
  return `${n.name}-${i}-${n.originPoint.x}-${n.originPoint.y}-${c}`
}

/**
 * Create an isochrone. Save results based on the network and timecutoff.
 */
const getIsochrone = (network, index, timeCutoff) => {
  const surface = network.travelTimeSurface
  const isochrone = jsolines({
    ...surface, // height, width, surface
    surface: surface.data,
    cutoff: timeCutoff,
    project ([x, y]) {
      const {lat, lng} = LeafletMap.prototype.unproject(
        [x + surface.west, y + surface.north],
        surface.zoom
      )
      return [lng, lat]
    }
  })

  // create the key for react-leaflet/GeoJSON here
  return {
    ...isochrone,
    key: toKey(network, index, timeCutoff),
    style: getIsochroneStyleFor(index),
    properties: {
      name: network.name,
      origin: [network.originPoint.x, network.originPoint.y],
      timeCutoff
    }
  }
}
