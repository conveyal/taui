// @flow
import gridualizer from '@conveyal/gridualizer'
import {createSelector} from 'reselect'

export default createSelector(
  (state) => state.data.grids,
  (grids = []) => grids.map(grid => grid.showOnMap &&
    gridualizer.createDrawTile({
      colorizer: gridualizer.colorizers.dot(),
      grid,
      interpolator: gridualizer.interpolators.bicubic
    })
  )
)
