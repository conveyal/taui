import Pure from '@conveyal/woonerf/components/pure'
import Color from 'color'
import React from 'react'
import toCapitalCase from 'lodash/capitalize'
import toSpaceCase from 'lodash/lowerCase'
import unique from 'lodash/uniq'

import {
  ACCESSIBILITY_IS_EMPTY,
  ACCESSIBILITY_IS_LOADING
} from '../constants'
import Icon from './icon'
import messages from '../utils/messages'

export default class RouteCard extends Pure {
  render () {
    const {
      active,
      alternate,
      accessibility,
      children,
      oldAccessibility,
      oldTravelTime,
      oldWaitTime,
      onClick,
      transitiveData,
      travelTime,
      waitTime
    } = this.props
    const className = 'Card' + (alternate ? ' Card-alternate' : '') + (active ? ' Card-active' : '')
    const accessibilityKeys = Object.keys(accessibility)
    const comparisonAccessibilityKeys = Object.keys(oldAccessibility || {})

    return (
      <div
        className={className}
        >
        <a
          className='CardTitle'
          onClick={onClick}
          tabIndex={0}
          title='Set system active'
          >{children}
          <span className='pull-right'>
            {active && <Icon type='map' />}
            {!active && 'show'}
          </span>
        </a>
        <div className='CardContent'>
          {comparisonAccessibilityKeys.length > 0
            ? <ShowAccess keys={accessibilityKeys} base={accessibility} />
            : <ShowDiff keys={accessibilityKeys} base={accessibility} comparison={oldAccessibility} />}
          {accessibility !== ACCESSIBILITY_IS_EMPTY &&
          accessibility !== ACCESSIBILITY_IS_LOADING &&
            <Journeys
              oldTravelTime={oldTravelTime}
              oldWaitTime={oldWaitTime}
              travelTime={travelTime}
              transitiveData={transitiveData}
              waitTime={waitTime}
              />}
        </div>
      </div>
    )
  }
}

function TripDiff ({
  oldTravelTime,
  travelTime
}) {
  const actualDiff = travelTime - oldTravelTime
  const nume = actualDiff > 0
    ? travelTime - oldTravelTime
    : oldTravelTime - travelTime
  const diff = parseInt((nume / oldTravelTime * 100).toFixed(1))

  if (oldTravelTime === 255) return <span className='increase'>{messages.NewTrip} <Icon type='star' /><br /></span>
  else if (actualDiff > 0) return <span className='pull-right decrease'><strong>{diff}</strong>%<Icon type='level-up' /><br /></span>
  else return <span className='pull-right increase'><strong>{diff * -1}</strong>%<Icon className='fa-rotate-180' type='level-up' /><br /></span>
}

function Journeys ({
  oldTravelTime,
  transitiveData,
  travelTime,
  waitTime
}) {
  if (!travelTime || !transitiveData) {
    return <div className='CardJourneys'>
      <div className='heading'>{messages.Systems.TripsTitle}</div>
      <div>{messages.Systems.SelectEnd}</div>
    </div>
  }

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
        <span className='CardIndex'>{jindex + 1}.</span>{segments}
      </div>
    )
  })

  return (
    <div>
      <div className='heading'>{messages.Systems.BestTripTitle}</div>
      <div className='BestTrip'>
        <div><strong> {travelTime}</strong> {messages.Units.Mins}</div>
        <div>{oldTravelTime && oldTravelTime !== travelTime &&
          <TripDiff
            oldTravelTime={oldTravelTime}
            travelTime={travelTime}
            />}
        </div>
        <div><strong>{waitTime}</strong> {messages.Units.Mins} {messages.Systems.Waiting}</div>
        <div>{bestTripSegments}</div>
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
          const color = route.route_color ? Color(`#${route.route_color}`) : Color('#0b2b40')
          seg.name = toCapitalCase(route.route_short_name)

          if (s.patterns && s.patterns.length > 0) {
            const patternNames = s.patterns.map((p) =>
              toCapitalCase(findRouteForPattern({id: p.pattern_id, patterns, routes}).route_short_name))
            seg.name = unique(patternNames).join(' / ')
          }

          seg.backgroundColor = color.string()
          seg.color = color.light() ? '#000' : '#fff'
          seg.type = typeToIcon[route.route_type]

          return seg
        })
    })
}

function findRouteForPattern ({id, patterns, routes}) {
  return routes.find((r) => r.route_id === patterns.find((p) => p.pattern_id === id).route_id)
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
  if (lc.indexOf('worker') !== -1 || lc.indexOf('population') !== -1) return <Icon type='child' />
  return <span />
}

function ShowAccess ({keys, base}) {
  return (
    <div className='CardAccess'>
      <div className='heading'>{messages.Systems.AccessTitle}</div>
      {base === ACCESSIBILITY_IS_EMPTY
        ? <span>{messages.Systems.SelectStart}</span>
        : base === ACCESSIBILITY_IS_LOADING
          ? <span>{messages.Systems.CalculatingAccessibility}</span>
          : keys.map((k, i) =>
            <div className='Metric' key={k}>
              <MetricIcon name={k} />
              <strong> {(base[k] | 0).toLocaleString()} </strong> {toSpaceCase(k)}
            </div>
          )}
    </div>
  )
}

function AccessDiffPercentage ({
  newAccess,
  originalAccess
}) {
  const actualDiff = newAccess - originalAccess
  const nume = actualDiff > 0
    ? newAccess - originalAccess
    : originalAccess - newAccess
  const diff = parseInt((nume / originalAccess * 100).toFixed(1))
  if (diff === 0) return <span />
  else if (actualDiff > 0) return <span className='pull-right increase'><strong>{diff}</strong>%<Icon type='level-up' /></span>
  else return <span className='pull-right decrease'><strong>{diff * -1}</strong>%<Icon className='fa-rotate-180' type='level-up' /></span>
}

function ShowDiff ({
  keys,
  base,
  comparison
}) {
  return (
    <div className='CardAccess'>
      <div className='heading'>{messages.Systems.AccessTitle}</div>
      {base === ACCESSIBILITY_IS_EMPTY
        ? <span>{messages.Systems.SelectStart}</span>
        : base === ACCESSIBILITY_IS_LOADING
          ? <span>{messages.Systems.CalculatingAccessibility}</span>
          : keys.map((key, i) =>
            <div className='Metric' key={key}>
              <MetricIcon name={key} /><strong> {(base[key] | 0).toLocaleString()} </strong> {toSpaceCase(key)}
              <AccessDiffPercentage newAccess={base[key]} originalAccess={comparison[key]} />
            </div>
          )}
    </div>
  )
}
