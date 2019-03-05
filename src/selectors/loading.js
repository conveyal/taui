import {createSelector} from 'reselect'

export default createSelector(
  state => state.activeFetches,
  fetches => fetches > 0
)
