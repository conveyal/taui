import lonlat from '@conveyal/lonlat'
import memoize from 'lodash/memoize'
import jsolines from 'jsolines'

/**
 * Create an isochrone. Save results based on the network and timecutoff.
 */
function getIsochrone(network, start, timeCutoff) {
  const surface = network.travelTimeSurface
  const isochrone = jsolines({
    ...surface, // height, width, surface
    surface: surface.data,
    cutoff: timeCutoff,
    project([x, y]) {
      const {lon, lat} = lonlat.fromPixel(
        {
          x: x + surface.west,
          y: y + surface.north
        },
        surface.zoom
      )
      return [lon, lat]
    }
  })
  return isochrone
}

export default memoize(
  getIsochrone,
  (n, s, c) => `${n.name}-${lonlat.toString(s.position)}-${c}`
)
