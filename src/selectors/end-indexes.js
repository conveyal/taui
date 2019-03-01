import get from 'lodash/get'
import { createSelector } from 'reselect'

import { coordinateToIndex } from '../utils/coordinate-to-point'

export default createSelector(
  state => get(state, 'end.position'),
  state => state.networks,
  (position, networks) =>
    networks.map(
      n => (position && n.ready ? coordinateToIndex(position, n) : -1)
    )
)
