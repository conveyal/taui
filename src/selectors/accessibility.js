// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectTravelTimeSurfaces from './travel-time-surfaces'
import accessibilityForGrid from '../utils/accessibility-for-grid'

export default createSelector(
  selectTravelTimeSurfaces,
  (state) => get(state, 'data.grids'),
  (state) => get(state, 'data.query'),
  (state) => get(state, 'timeCutoff.selected'),
  (surfaces, grids, query, cutoff) =>
    surfaces.map(surface => grids.map(grid => surface && surface.data && grid.data && query
      ? accessibilityForGrid({surface: surface.data, grid, query, cutoff})
      : -1
    ))
)
