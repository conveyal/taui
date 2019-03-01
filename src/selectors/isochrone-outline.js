import get from 'lodash/get'
import { createSelector } from 'reselect'

import { darkBlue } from '../constants'
import getIsochroneForNetwork from '../utils/get-isochrone-for-network'

export default createSelector(
  state => state.start,
  state => state.networks,
  state => state.timeCutoff,
  (start, networks = [], timeCutoff) => {
    const n = networks[0]
    const data = get(n, 'travelTimeSurface.data')
    if (start && data) {
      return {
        type: 'FeatureCollection',
        properties: {
          name: n.name
        },
        features: [
          {
            ...getIsochroneForNetwork(n, start, timeCutoff),
            properties: {
              color: darkBlue,
              opacity: 1,
              timeCutoff,
              width: 1
            }
          }
        ]
      }
    }
  }
)
