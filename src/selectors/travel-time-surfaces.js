import {createSelector} from 'reselect'

export default createSelector(
  state => state.networks,
  networks => networks.map(n => n.travelTimeSurface)
)
