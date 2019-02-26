import get from 'lodash/get'
import {createSelector} from 'reselect'

import {colors, cutoffs, opacities} from '../constants'
import getIsochroneForNetwork from '../utils/get-isochrone-for-network'

export default createSelector(
  state => state.start,
  state => state.networks,
  state => state.timeCutoff,
  (start, networks = [], timeCutoff) =>
    networks.map((n, i) => {
      const data = get(n, 'travelTimeSurface.data')
      if (start && data) {
        return {
          type: 'FeatureCollection',
          properties: {
            name: n.name
          },
          features: [{
            ...getIsochroneForNetwork(n, start, timeCutoff),
            properties: {
              color: n.hexColor || colors[i].hex,
              opacity: 1,
              timeCutoff: timeCutoff,
              width: 1
            }
          }]
        }
      }
    })
)
