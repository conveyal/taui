import Color from 'color'
import React from 'react'
import toCapitalCase from 'to-capital-case'

const RouteCard = ({active, accessibility, oldAccessibility, children, transitiveData, travelTime, oldTravelTime, onClick}) => {
  let className = 'RouteCard'

  if (active) {
    className += ' RouteCard-active'
  }

  const accessibilityKeys = Object.keys(accessibility)
  const comparisonAccessibilityKeys = Object.keys(oldAccessibility || {})

  let access = null
  if (comparisonAccessibilityKeys.length > 0) {
    access = showDiff(accessibilityKeys, accessibility, oldAccessibility)
  } else if (accessibilityKeys.length > 0) {
    access = showAccess(accessibilityKeys, accessibility)
  }

  return (
    <div
      className={className}
      onClick={onClick}
      >
      <div className='RouteCardTitle'>{children}</div>
      <div className='RouteCardContent'>{access}</div>
      {travelTime && transitiveData && renderJourneys({ oldTravelTime, travelTime, transitiveData })}
    </div>
  )
}

function renderJourneys ({ oldTravelTime, transitiveData, travelTime }) {
  const journeys = extractRelevantTransitiveInfo(transitiveData)

  if (travelTime === 255 || journeys.length === 0) {
    return <div className='RouteCard'><div className='RouteCardContent'>No travel options found</div></div>
  }

  let difference = ''
  if (oldTravelTime) {
    difference = oldTravelTime - travelTime
    if (oldTravelTime === 255) difference = 'New trip!'
    else if (difference > 0) difference = `${difference} minute(s) faster!`
    else if (difference === 0) difference = 'No change.'
    else difference = `${difference * -1} minute(s) slower.`
    difference = ` — ${difference}`
  }

  return (
    <div>
      <div className='RouteCardTitle'><strong>{travelTime}</strong> minute trip {difference}</div>
      <div className='RouteCardContent'>
        {journeys.map((segments, jindex) => {
          return (
            <div key={`journey-${jindex}`}>
              <span className='RouteCardIndex'>{jindex + 1}</span>
              {segments.map((s, sindex) => {
                return (
                  <span
                    className='RouteCardSegment'
                    key={`journey-${jindex}-segment-${sindex}`}
                    style={{
                      backgroundColor: (s.backgroundColor || 'inherit'),
                      color: (s.color || 'inherit')
                    }}
                    >
                    <i className={`fa fa-${s.type}`}></i> {s.name}
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// TODO: filter journeys that have same pattern id sequences
function extractRelevantTransitiveInfo ({journeys, patterns, routes, stops}) {
  return journeys
    .map(j => {
      return j.segments
        .filter(s => !!s.pattern_id || !!s.patterns)
        .map(s => {
          const pid = s.pattern_id || s.patterns[0].pattern_id
          const seg = {}
          const route = findRouteForPattern({id: pid, patterns, routes})
          const color = Color(`#${route.route_color}`)
          seg.name = route.route_short_name

          if (s.patterns && s.patterns.length > 0) {
            seg.name = s.patterns.map(p => findRouteForPattern({id: p.pattern_id, patterns, routes}).route_short_name).join(' / ')
          }

          seg.backgroundColor = color.rgbaString()
          seg.color = color.light() ? '#000' : '#fff'
          seg.type = typeToIcon[route.route_type]

          return seg
        })
    })
}

function findRouteForPattern ({id, patterns, routes}) {
  return routes.find(r => r.route_id === patterns.find(p => p.pattern_id === id).route_id)
}

const typeToIcon = {
  0: 'subway',
  1: 'subway',
  2: 'train',
  3: 'bus'
}

function showAccess (keys, base) {
  return (
    <div className='RouteCardAccess'>
      {keys.map((k, i) => {
        return <div key={k}>
          <span className='RouteCardSegment'>{(base[k] | 0).toLocaleString()} {toCapitalCase(k)}</span>
        </div>
      })}
    </div>
  )
}

function showDiff (keys, base, comparison) {
  return (
    <div className='RouteCardAccess'>
      {keys.map((k, i) => {
        let diff = parseInt((base[k] - comparison[k]) / base[k] * 100, 10)

        if (diff > 0) diff = diff.toLocaleString() + '% increase'
        else if (diff === 0) diff = 'no change'
        else diff = (diff * -1).toLocaleString() + '% decrease'

        return <div key={k}>
          <span className='RouteCardSegment'>{(base[k] | 0).toLocaleString()} {toCapitalCase(k)} ({diff})</span>
        </div>
      })}
    </div>
  )
}

export default RouteCard
