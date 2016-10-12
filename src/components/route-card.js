import Color from 'color'
import React from 'react'
import toCapitalCase from 'to-capital-case'
import toSpaceCase from 'to-space-case'

import Icon from './icon'
import messages from '../utils/messages'

const RouteCard = ({
  active,
  alternate,
  accessibility,
  children,
  oldAccessibility,
  oldTravelTime,
  onClick,
  transitiveData,
  travelTime
}) => {
  const className = 'Card' + (alternate ? ' Card-alternate' : '') + (active ? ' Card-active' : '')
  const accessibilityKeys = Object.keys(accessibility)
  const comparisonAccessibilityKeys = Object.keys(oldAccessibility || {})

  const access = comparisonAccessibilityKeys.length > 0
    ? showDiff(accessibilityKeys, accessibility, oldAccessibility)
    : showAccess(accessibilityKeys, accessibility)

  return (
    <div
      className={className}
      >
      <div className='CardTitle' onClick={onClick}>{children}
        <span className='pull-right'>
          {active && <Icon type='map' />}
          {!active && 'show'}
        </span>
      </div>
      <div className='CardContent'>
        {access}
        {travelTime && transitiveData && renderJourneys({ oldTravelTime, travelTime, transitiveData })}
      </div>
    </div>
  )
}

function TripDiff ({
  oldTravelTime,
  travelTime
}) {
  const difference = oldTravelTime - travelTime

  if (oldTravelTime === 255) return <span className='increase'>{messages.NewTrip} <Icon type='star' /></span>
  else if (difference > 0) return <span className='increase'>{difference} {messages.Units.Mins} {messages.Faster}</span>
  else if (difference < 0) return <span className='decrease'>{difference * -1} {messages.Units.Mins} {messages.Slower}</span>
}

function renderJourneys ({ oldTravelTime, transitiveData, travelTime }) {
  const journeys = extractRelevantTransitiveInfo(transitiveData)

  if (travelTime === 255 || journeys.length === 0) {
    return <div className='CardJourneys'>
      <div className='heading'>{messages.Systems.TripsTitle}</div>
      <div>{messages.Systems.TripsEmpty}</div>
    </div>
  }

  const [bestTripSegments, ...alternateTripSegments] = journeys.map((segments, jindex) => {
    return segments.map((s, sindex) => {
      return (
        <span
          className='CardSegment'
          key={`journey-${jindex}-segment-${sindex}`}
          style={{
            backgroundColor: (s.backgroundColor || 'inherit'),
            color: (s.color || 'inherit')
          }}
          >
          <i className={`fa fa-${s.type}`} /> {s.name}
        </span>
      )
    })
  })

  const alternateTrips = alternateTripSegments.map((segments, jindex) => {
    return (
      <div className='Trip' key={`journey-${jindex}`}>
        <span className='CardIndex'>#{jindex + 1}</span>
        {segments}
      </div>
    )
  })

  return (
    <div>
      <div className='heading'>{messages.Systems.BestTripTitle}</div>
      <div className='Metric'>
        {bestTripSegments}
        <Icon type='clock-o' /><strong>{travelTime}</strong> {messages.Units.Mins}
        {oldTravelTime && <span className='pull-right'>
          <TripDiff
            oldTravelTime={oldTravelTime}
            travelTime={travelTime}
            />
        </span>}
      </div>
      {alternateTrips.length > 0 &&
        <div>
          <div className='heading'>{messages.Systems.AlternateTripsTitle}</div>
          <div className='Trips'>{alternateTrips}</div>
        </div>
      }
    </div>
  )
}

// TODO: filter journeys that have same pattern id sequences
function extractRelevantTransitiveInfo ({
  journeys,
  patterns,
  routes,
  stops
}) {
  return journeys
    .map((j) => {
      return j.segments
        .filter((s) => !!s.pattern_id || !!s.patterns)
        .map((s) => {
          const pid = s.pattern_id || s.patterns[0].pattern_id
          const seg = {}
          const route = findRouteForPattern({id: pid, patterns, routes})
          const color = Color(`#${route.route_color}`)
          seg.name = toCapitalCase(route.route_short_name)

          if (s.patterns && s.patterns.length > 0) {
            seg.name = uniq(s.patterns.map((p) =>
              toCapitalCase(findRouteForPattern({id: p.pattern_id, patterns, routes}).route_short_name))).join(' / ')
          }

          seg.backgroundColor = color.rgbaString()
          seg.color = color.light() ? '#000' : '#fff'
          seg.type = typeToIcon[route.route_type]

          return seg
        })
    })
}

function findRouteForPattern ({id, patterns, routes}) {
  return routes.find((r) => r.route_id === patterns.find((p) => p.pattern_id === id).route_id)
}

function uniq (a) {
  return [...new Set(a)]
}

const typeToIcon = {
  0: 'subway',
  1: 'subway',
  2: 'train',
  3: 'bus'
}

function MetricIcon ({
  name
}) {
  const lc = name.toLowerCase()
  if (lc.indexOf('job') !== -1) return <Icon type='building' />
  if (lc.indexOf('worker') !== -1) return <Icon type='child' />
}

function showAccess (keys, base) {
  return (
    <div className='CardAccess'>
      <div className='heading'>Access to</div>
      {keys.map((k, i) => <div className='Metric' key={k}><MetricIcon name={k} /><strong> {(base[k] | 0).toLocaleString()} </strong> {toSpaceCase(k)}</div>)}
    </div>
  )
}

function AccessDiffPercentage ({
  diff
}) {
  if (diff > 0) return <span className='pull-right increase'>{diff.toLocaleString()}%<Icon type='level-up' /></span>
  else if (diff < 0) return <span className='pull-right decrease'>{(diff * -1).toLocaleString()}%<Icon className='fa-rotate-180' type='level-up' /></span>
}

function showDiff (keys, base, comparison) {
  return (
    <div className='CardAccess'>
      <div className='heading'>Access to</div>
      {keys.map((k, i) => {
        const diff = parseInt((base[k] - comparison[k]) / base[k] * 100, 10)
        return <div className='Metric' key={k}><MetricIcon name={k} /><strong> {(base[k] | 0).toLocaleString()} </strong> {toSpaceCase(k)} <AccessDiffPercentage diff={diff} /></div>
      })}
    </div>
  )
}

export default RouteCard
