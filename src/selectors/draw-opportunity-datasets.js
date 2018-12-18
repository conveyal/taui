// @flow
import gridualizer from '@conveyal/gridualizer'
import {createSelector} from 'reselect'

// Copied from Gridualizer
function DotColorizer (density) {
  if (density > 2) return [255, 0, 0, 200] // RED
  const r = Math.random() // range 0..1
  if (r < density) return [0, 0, 0, 255 / 3] // black, semi-opaque dot
  else return [0, 0, 0, 0] // black, transparent dot
}
DotColorizer.normalize = true

export default createSelector(
  (state) => state.data.grids,
  (grids = []) => grids.map(grid => grid.showOnMap &&
    gridualizer.createDrawTile({
      colorizer: DotColorizer,
      grid,
      interpolator: gridualizer.interpolators.bicubic
    })
  )
)
