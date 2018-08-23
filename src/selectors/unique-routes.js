// @flow
import {createSelector} from 'reselect'

import selectAllTransitiveData from './all-transitive-data'

const routeToString = s =>
  s.map(s => `${s.name}-${s.backgroundColor}-${s.type}`).join('-')

export default createSelector(
  selectAllTransitiveData,
  (allTransitiveData = []) => allTransitiveData.map(td => {
    const foundKeys = {}
    return (td.routeSegments || []).reduce((uniqueRoutes, route) => {
      const key = routeToString(route)
      if (!foundKeys[key]) {
        foundKeys[key] = true
        return [...uniqueRoutes, route]
      }
      return uniqueRoutes
    }, [])
  })
)
