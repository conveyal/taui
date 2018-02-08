// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectTravelTimeSurfaces from './travel-time-surfaces'
import accessibilityForGrid from '../utils/accessibility-for-grid'

export default createSelector(
  selectTravelTimeSurfaces,
  (state) => get(state, 'data.grids'),
  (state) => get(state, 'data.origins'),
  (state) => get(state, 'timeCutoff.selected'),
  (surfaces, grids, origins, cutoff) =>
    surfaces.map((surface, index) =>
      grids.map(grid => surface && surface.data && grid.data && origins[index] && origins[index].query
        ? accessibilityForGrid({surface: surface.data, grid, query: origins[index].query, cutoff})
        : -1
      )
    )
)
