// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

export default createSelector(
  (state) => get(state, 'data.origins'),
  (origins) => {
    const index = origins.findIndex(o => !!o.active)
    return index >= 0 ? index : 0
  }
)
