// @flow
import Color from 'color'
import toCapitalCase from 'lodash/capitalize'
import unique from 'lodash/uniq'

const TYPE_TO_ICON = ['subway', 'subway', 'train', 'bus']

/**
 * Throw error if value not found. No need to null check for Flow.
 */
function fnd (a, fn) {
  const ret = a.find(fn)
  if (!ret) throw new Error('value not found')
  return ret
}

/**
 * Take a transitive journey and extract the route segments. Used to render
 * the transit steps of a journey.
 */
export default function getRouteSegmentsFromJourney (journey: any, fullPatternIndex: any[], fullRouteIndex: any[]) {
  return journey.segments.filter(s => !!s.pattern_id || !!s.patterns).map(s => {
    const pid = s.pattern_id || s.patterns[0].pattern_id
    const seg = {}
    const route = findRouteForPatternId(pid, fullPatternIndex, fullRouteIndex)

    const color = route.route_color
      ? Color(`#${route.route_color}`)
      : Color('#0b2b40')
    seg.name = toCapitalCase(route.route_short_name)

    if (s.patterns && s.patterns.length > 0) {
      const patternNames = s.patterns.map(p =>
        toCapitalCase(
          findRouteForPatternId(p.pattern_id, fullPatternIndex, fullRouteIndex)
            .route_short_name
        )
      )
      seg.name = unique(patternNames).join(' / ')
    }

    seg.backgroundColor = color.string()
    seg.color = color.light() ? '#000' : '#fff'
    seg.type = TYPE_TO_ICON[route.route_type]

    return seg
  })
}

function findRouteForPatternId (pid: string, patterns, routes) {
  return fnd(routes,
    r => r.route_id === fnd(patterns, p => p.pattern_id === pid).route_id
  )
}
