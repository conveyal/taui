// @flow
import {createSelector} from 'reselect'

import selectActiveOriginIndex from './active-origin-index'
import selectTransitiveData from './all-transitive-data'

export default createSelector(
  selectActiveOriginIndex,
  selectTransitiveData,
  (index, transitiveDataForAllOrigins) => transitiveDataForAllOrigins[index]
)
