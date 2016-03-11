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
                    <i className='fa fa-bus'></i> {s.name}
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
          const seg = {
            type: s.type.toLowerCase()
          }
          seg.color = '#333'

          if (s.from_stop_index) seg.from = stops[s.from_stop_index].stop_name
          if (s.to_stop_index) seg.to = stops[s.to_stop_index].stop_name

          if (s.from) {
            if (s.from.stop_id) seg.from = stops[parseInt(s.from.stop_id, 10)].stop_name
            else seg.start = true
          }
          if (s.to) {
            if (s.to.stop_id) seg.to = stops[parseInt(s.to.stop_id, 10)].stop_name
            else seg.end = true
          }

          const route = routes[parseInt(patterns[parseInt(s.pattern_id, 10)].route_id, 10)]
          const color = Color(`#${route.route_color}`)
          seg.name = route.route_long_name
          seg.backgroundColor = color.rgbaString()
          seg.color = color.light() ? '#000' : '#fff'

          return seg
        })
    })
}

export default RouteCard
