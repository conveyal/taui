import {createSelector} from 'reselect'

export default createSelector(
  state => state.destinations[0],
  (accessibility = {}) => Object.keys(accessibility.accessibility || {})
)
