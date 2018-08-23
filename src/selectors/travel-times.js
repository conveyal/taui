// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectEndIndexes from './end-indexes'

export default createSelector(
  state => get(state, 'data.networks'),
  selectEndIndexes,
  (networks, endIndexes) =>
    networks.map(
      (n, i) =>
        (n.travelTimeSurface && n.travelTimeSurface.data
          ? n.travelTimeSurface.data[endIndexes[i]]
          : 255)
    )
)
