import Color from 'color'
import React from 'react'

const RouteCard = ({alt, transitiveData, travelTime, oldTravelTime}) => {
  const journeys = extractRelevantTransitiveInfo(transitiveData)
  let className = 'RouteCard'

  if (alt) {
    className += ' RouteCard-alt'
  }

  if (travelTime === 255 || journeys.length === 0) {
    return <div className='RouteCard'><div className='RouteCardContent'>No travel options found</div></div>
  }

  let difference = ''
  if (oldTravelTime) {
    difference = oldTravelTime - travelTime
    if (oldTravelTime === 255) difference = 'New trip!'
    else if (difference > 0) difference = difference + ' minute(s) faster!'
    else if (difference === 0) difference = 'No change.'
    else difference = difference + ' minute(s) slower.'
    difference = ` — ${difference}`
  }

  return (
    <div className={className}>
      <div className='RouteCardTitle'><strong>{travelTime}</strong> minute trip {difference}</div>
      <div className='RouteCardContent'>
        {journeys.map((segments, jindex) => {
          return (
            <div key={`journey-${jindex}`}>
              <span className='RouteCardSegmentIndex'>{jindex + 1}</span>
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
        .filter(s => !!s.pattern_id)
        .map(s => {
          const seg = {}
          const route = routes.find(r => r.route_id === patterns.find(p => p.pattern_id === s.pattern_id).route_id)
          const color = Color(`#${route.route_color}`)
          seg.name = route.route_long_name
          seg.backgroundColor = color.rgbaString()
          seg.color = color.light() ? '#000' : '#fff'
          seg.type = typeToIcon[route.route_type]

          return seg
        })
    })
}

const typeToIcon = {
  0: 'subway',
  1: 'subway',
  2: 'train',
  3: 'bus'
}

export default RouteCard
