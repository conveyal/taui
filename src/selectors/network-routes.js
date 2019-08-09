import lonlat from '@conveyal/lonlat'
import get from 'lodash/get'
import memoize from 'lodash/memoize'
import {createSelector} from 'reselect'

import createTransitiveRoutes from '../utils/create-transitive-routes'

/**
 * This assumes loaded query, paths, and targets.
 */
const memoizedTransitiveRoutes = memoize(
  createTransitiveRoutes,
  (n, e, i, s) => `${n.name}-${i}-${lonlat.toString(s)}-${lonlat.toString(e)}`
)

export default createSelector(
  state => state.networks,
  state => state.start,
  state => state.end,
  (networks, start, end) =>
    networks.map((n, nIndex) => {
      const td = n.transitive
      const startPosition = get(start, 'position')
      const endPosition = get(end, 'position')
      if (startPosition && endPosition && n.paths && n.targets && td.patterns) {
        return memoizedTransitiveRoutes(n, endPosition, nIndex, startPosition)
      } else {
        return []
      }
    })
)
