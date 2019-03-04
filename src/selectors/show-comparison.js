import {createSelector} from 'reselect'

export default createSelector(
  state => state.networks,
  networks => networks.length > 1
)
