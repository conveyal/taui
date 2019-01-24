import {createSelector} from 'reselect'

export default createSelector(
  (state) => state.grids,
  (grids) => grids[0]
)
