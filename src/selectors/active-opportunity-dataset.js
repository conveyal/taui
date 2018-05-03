// @flow
import {createSelector} from 'reselect'

export default createSelector(
  (state) => state.data.grids,
  (grids) => grids[0]
)
