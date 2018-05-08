// @flow
import gridualizer from '@conveyal/gridualizer'
import {createSelector} from 'reselect'

import selectActiveOpportunityDataset from './active-opportunity-dataset'

export default createSelector(
  selectActiveOpportunityDataset,
  (grid) => grid && grid.showOnMap &&
    gridualizer.createDrawTile({
      colorizer: gridualizer.colorizers.dot(),
      grid,
      interpolator: gridualizer.interpolators.bicubic
    })
)
