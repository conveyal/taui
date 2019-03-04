import {createSelector} from 'reselect'

export default createSelector(
  state => state.networks,
  networks => {
    const index = networks.findIndex(n => !!n.active)
    return index >= 0 ? index : 0
  }
)
