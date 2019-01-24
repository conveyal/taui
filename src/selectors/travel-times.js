import {createSelector} from 'reselect'

import selectEndIndexes from './end-indexes'

export default createSelector(
  state => state.networks,
  selectEndIndexes,
  (networks, endIndexes) =>
    networks.map(
      (n, i) =>
        (n.travelTimeSurface && n.travelTimeSurface.data
          ? n.travelTimeSurface.data[endIndexes[i]]
          : 255)
    )
)
