// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

export default createSelector(
  state => get(state, 'data.networks'),
  networks => networks.map(n => n.travelTimeSurface)
)
