// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

export default createSelector(
  state => get(state, 'data.networks'),
  networks => {
    const index = networks.findIndex(n => !!n.active)
    return index >= 0 ? index : 0
  }
)
