// @flow
import Color from 'color'
import toCapitalCase from 'lodash/capitalize'
import get from 'lodash/get'
import unique from 'lodash/uniq'
import {createSelector} from 'reselect'

export default createSelector(
  state => get(state, 'data.query.transitiveData'),
  (transitiveData = []) => transitiveData.map(extractRelevantTransitiveInfo)
)

// TODO: filter journeys that have same pattern id sequences
const extractRelevantTransitiveInfo = ({journeys, patterns, routes, stops}) =>
  journeys.map(j =>
    j.segments.filter(s => !!s.pattern_id || !!s.patterns).map(s => {
      const pid = s.pattern_id || s.patterns[0].pattern_id
      const seg = {}
      const route = findRouteForPattern({id: pid, patterns, routes})
      const color = route.route_color
        ? Color(`#${route.route_color}`)
        : Color('#0b2b40')
      seg.name = toCapitalCase(route.route_short_name)

      if (s.patterns && s.patterns.length > 0) {
        const patternNames = s.patterns.map(p =>
          toCapitalCase(
            findRouteForPattern({id: p.pattern_id, patterns, routes})
              .route_short_name
          )
        )
        seg.name = unique(patternNames).join(' / ')
      }

      seg.backgroundColor = color.string()
      seg.color = color.light() ? '#000' : '#fff'
      seg.type = typeToIcon[route.route_type]

      return seg
    })
  )

const findRouteForPattern = ({id, patterns, routes}) =>
  routes.find(
    r => r.route_id === patterns.find(p => p.pattern_id === id).route_id
  )

const typeToIcon = ['subway', 'subway', 'train', 'bus']
