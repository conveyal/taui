// @flow
import jsolines from 'jsolines'
import {Map as LeafletMap} from 'leaflet'
import get from 'lodash/get'
import memoize from 'lodash/memoize'
import {createSelector} from 'reselect'
import uuid from 'uuid'

export default createSelector(
  (state) => get(state, 'data.origins'),
  (state) => get(state, 'timeCutoff.selected'),
  (origins = [], timeCutoff) => origins.map((origin, index) => {
    if (origin.travelTimeSurface && origin.travelTimeSurface.data) {
      return getIsochrone(origin, index, timeCutoff)
    }
  })
)

/**
 * Create an isochrone. Save results based on the origin and timecutoff.
 */
const getIsochrone = memoize((origin, index, timeCutoff) => {
  const surface = origin.travelTimeSurface
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

  // create the uuid here so that if
  return {...isochrone, key: uuid.v4()}
}, (o, i, c) => `${o.name}-${i}-${o.originPoint.x}-${o.originPoint.y}-${c}`)
