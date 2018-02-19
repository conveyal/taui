// @flow
import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectTravelTimeSurfaces from './travel-time-surfaces'
import accessibilityForGrid from '../utils/accessibility-for-grid'

export default createSelector(
  selectTravelTimeSurfaces,
  state => get(state, 'data.grids'),
  state => get(state, 'data.networks'),
  state => get(state, 'timeCutoff.selected'),
  (surfaces, grids, networks, cutoff) =>
    surfaces.map((surface, index) =>
      grids.map(
        grid =>
          (surface &&
            surface.data &&
            grid.data &&
            networks[index] &&
            networks[index].query
            ? accessibilityForGrid({
              surface: surface.data,
              grid,
              query: networks[index].query,
              cutoff
            })
            : -1)
      )
    )
)
