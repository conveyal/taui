// @flow
import {createSelector} from 'reselect'

import selectActiveNetworkIndex from './active-network-index'
import selectTransitiveData from './all-transitive-data'

export default createSelector(
  selectActiveNetworkIndex,
  selectTransitiveData,
  (index, transitiveDataForAllNetworks) => transitiveDataForAllNetworks[index]
)
