// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

export default createSelector(
  state => get(state, 'data.origins'),
  (origins) => origins.length > 1
)
