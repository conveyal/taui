// @flow
import gdlz from '@conveyal/gridualizer'
import {createSelector} from 'reselect'
import get from 'lodash/get'

const colors = [
  'rgba(0, 0, 0, 0.0)',
  'rgba(66, 105, 164, 0.2)',
  'rgba(66, 105, 164, 0.4)',
  'rgba(66, 105, 164, 0.6)',
  'rgba(66, 105, 164, 0.8)'
]

colors.reverse()

export default createSelector(
  state => get(state, 'data.networks'),
  (networks = []) =>
    networks.map(n => {
      if (n.travelTimeSurface && n.travelTimeSurface.data) {
        const eq = gdlz.classifiers.equal()
        const breaks = eq({min: 0, max: 120}, colors.length)
        return gdlz.createDrawTile({
          colorizer: gdlz.colorizers.choropleth(breaks, colors),
          grid: n.travelTimeSurface,
          interpolator: gdlz.interpolators.spline
        })
      }
    })
)
