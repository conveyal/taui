// @flow
import gdlz from '@conveyal/gridualizer'
import {scaleQuantize} from 'd3-scale'
import {createSelector} from 'reselect'
import get from 'lodash/get'

const TRANSPARENT = [0, 0, 0, 0]
const OPACITY_RANGE = [0.8, 0.6, 0.4, 0.2]
const MAX_TIME = 60
const getOpacity = scaleQuantize()
  .domain([0, MAX_TIME])
  .range(OPACITY_RANGE.map(o => Math.floor(o * 255)))
const colorizer = (v) => {
  return v < 0 || v > MAX_TIME
    ? TRANSPARENT
    : [35, 137, 201, getOpacity(v)] // Conveyal blue
}

export default createSelector(
  state => get(state, 'data.networks'),
  (networks = []) =>
    networks.map(n => {
      if (n.travelTimeSurface && n.travelTimeSurface.data) {
        return gdlz.createDrawTile({
          colorizer,
          grid: n.travelTimeSurface,
          interpolator: gdlz.interpolators.bicubic
        })
      }
    })
)
