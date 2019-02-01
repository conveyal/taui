import {createSelector} from 'reselect'

import {colors, cutoffs, opacities} from '../constants'
import getIsochroneForNetwork from '../utils/get-isochrone-for-network'

export default createSelector(
  state => state.start,
  state => state.networks,
  (start, networks = []) =>
    networks.map((n, i) => {
      if (start && n.travelTimeSurface && n.travelTimeSurface.data) {
        return {
          type: 'FeatureCollection',
          properties: {
            name: n.name,
            type: i === 0 ? 'fill' : 'line'
          },
          features: cutoffs.map((cutoff, cutoffIndex) => ({
            ...getIsochroneForNetwork(n, start, cutoff),
            properties: {
              color: colors[i].hex,
              opacity: opacities[cutoffIndex],
              timeCutoff: cutoff,
              width: 2
            }
          }))
        }
      }
    })
)

