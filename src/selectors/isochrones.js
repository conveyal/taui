// @flow
import jsolines from 'jsolines'
import {Map as LeafletMap} from 'leaflet'
import get from 'lodash/get'
import memoize from 'lodash/memoize'
import {createSelector} from 'reselect'
import uuid from 'uuid'

export default createSelector(
  state => get(state, 'data.networks'),
  state => get(state, 'timeCutoff.selected'),
  (networks = [], timeCutoff) =>
    networks.map((network, index) => {
      if (network.travelTimeSurface && network.travelTimeSurface.data) {
        return getIsochrone(network, index, timeCutoff)
      }
    })
)

/**
 * Create an isochrone. Save results based on the network and timecutoff.
 */
const getIsochrone = memoize((network, index, timeCutoff) => {
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

  // create the uuid for react-leaflet/GeoJSON here
  return {...isochrone, key: uuid.v4()}
}, (n, i, c) => `${n.name}-${i}-${n.originPoint.x}-${n.originPoint.y}-${c}`)
