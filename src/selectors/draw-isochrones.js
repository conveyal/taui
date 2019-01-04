// @flow
import gdlz from '@conveyal/gridualizer'
import {scaleQuantize} from 'd3-scale'
import {createSelector} from 'reselect'
import get from 'lodash/get'

import {COLORS_RGB} from '../constants'

const TRANSPARENT = [0, 0, 0, 0]
const OPACITY_RANGE = [1, 0.75, 0.5, 0.25]
const MAX_TIME = 60
const getOpacity = scaleQuantize()
  .domain([0, MAX_TIME])
  .range(OPACITY_RANGE.map(o => Math.floor(o * 255)))
const colorizer = (i) => (v) => {
  return v < 0 || v > MAX_TIME
    ? TRANSPARENT
    : [...COLORS_RGB[i], getOpacity(v)] // Conveyal blue
}

export default createSelector(
  state => get(state, 'data.networks', []),
  (networks = []) =>
    networks.map((n, i) => {
      if (n.showOnMap && n.travelTimeSurface && n.travelTimeSurface.data) {
        return gdlz.createDrawTile({
          colorizer: colorizer(i),
          grid: n.travelTimeSurface,
          interpolator: gdlz.interpolators.bicubic
        })
      }
    })
)
