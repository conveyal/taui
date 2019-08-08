import get from 'lodash/get'
import reduceRight from 'lodash/reduceRight'
import {createSelector} from 'reselect'

import {colors} from '../constants'
import getIsochroneForNetwork from '../utils/get-isochrone-for-network'

export default createSelector(
  state => state.start,
  state => state.networks,
  state => state.timeCutoff,
  state => state.percentileIndex,
  (start, networks = [], timeCutoff, percentileIndex) =>
    reduceRight(
      networks,
      (isochrones, n, i) => {
        const data = get(n, 'travelTimeSurface.data')
        const features =
          start && data
            ? getIsochroneForNetwork(n, timeCutoff, start, percentileIndex)
            : {}

        const isochrone = {
          type: 'FeatureCollection',
          properties: {
            name: n.name,
            id: `isochrone-${i}`
          },
          features: [
            {
              ...features,
              properties: {
                color: n.hexColor || colors[i].hex,
                opacity: 1,
                timeCutoff: timeCutoff,
                width: 1
              }
            }
          ]
        }

        return [...isochrones, isochrone]
      },
      []
    )
)
