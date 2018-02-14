// @flow
import React from 'react'
import toSpaceCase from 'lodash/lowerCase'

import Icon from './icon'
import messages from '../utils/messages'

type Props = {
  active: boolean,
  alternate: boolean,
  accessibility: number[],
  children?: any,
  grids: any[],
  hasEnd: boolean,
  hasStart: boolean,
  oldAccessibility: any,
  oldTravelTime: number,
  onClick(): void,
  routeSegments: any[],
  showComparison: boolean,
  travelTime: number
}

export default ({
  active,
  alternate,
  accessibility,
  children,
  grids,
  hasEnd,
  hasStart,
  oldAccessibility,
  oldTravelTime,
  onClick,
  routeSegments,
  showComparison,
  travelTime
}: Props) => (
  <div
    className={
      'Card' +
        (alternate ? ' Card-alternate' : '') +
        (active ? ' Card-active' : '')
    }
  >
    <a
      className='CardTitle'
      onClick={onClick}
      tabIndex={0}
      title='Set network active'
    >
      {children}
      <span className='pull-right'>
        {active && <Icon type='map' />}
        {!active && messages.Systems.Show}
      </span>
    </a>
    <div className='CardContent'>
      <div className='CardAccess'>
        <div className='heading'>
          {messages.Systems.AccessTitle}
        </div>
        {hasStart
          ? showComparison
            ? <ShowDiff
              accessibility={accessibility}
              comparison={oldAccessibility}
              grids={grids}
              />
            : <ShowAccess accessibility={accessibility} grids={grids} />
          : <span>{messages.Systems.SelectStart}</span>}
      </div>
      {hasStart && hasEnd &&
        <RouteSegments
          routeSegments={routeSegments}
          oldTravelTime={oldTravelTime}
          travelTime={travelTime}
        />}
    </div>
  </div>
)

function TripDiff ({oldTravelTime, travelTime}) {
  const actualDiff = travelTime - oldTravelTime
  const nume = actualDiff > 0
    ? travelTime - oldTravelTime
    : oldTravelTime - travelTime
  const diff = parseInt((nume / oldTravelTime * 100).toFixed(1))

  if (oldTravelTime === 255) {
    return (
      <span className='increase'>
        {messages.NewTrip} <Icon type='star' />
        <br />
      </span>
    )
  } else if (actualDiff > 0) {
    return (
      <span className='pull-right decrease'>
        <strong>{diff}</strong>%<Icon type='level-up' />
        <br />
      </span>
    )
  } else {
    return (
      <span className='pull-right increase'>
        <strong>{diff * -1}</strong>
        %
        <Icon className='fa-rotate-180' type='level-up' />
        <br />
      </span>
    )
  }
}

function RouteSegments ({routeSegments, oldTravelTime, travelTime}) {
  if (!travelTime || !routeSegments) {
    return (
      <div className='CardJourneys'>
        <div className='heading'>
          {messages.Systems.TripsTitle}
        </div>
        <div>
          {messages.Systems.SelectEnd}
        </div>
      </div>
    )
  }

  if (travelTime === 255 || routeSegments.length === 0) {
    return (
      <div className='CardJourneys'>
        <div className='heading'>
          {messages.Systems.TripsTitle}
        </div>
        <div>
          {messages.Systems.TripsEmpty}
        </div>
      </div>
    )
  }

  const [bestJourney, ...alternateJourneys] = routeSegments

  return (
    <div>
      <div className='heading'>
        {messages.Systems.BestTripTitle}
      </div>
      <div className='BestTrip'>
        <div>
          <strong> {travelTime}</strong> {messages.Units.Mins}
        </div>
        <div>
          {oldTravelTime &&
            oldTravelTime !== travelTime &&
            <TripDiff oldTravelTime={oldTravelTime} travelTime={travelTime} />}
        </div>
        <div>
          {bestJourney.map((segment, index) => (
            <Segment key={index} segment={segment} />
          ))}
        </div>
      </div>
      {routeSegments.length > 1 &&
        <div>
          <div className='heading'>
            {messages.Systems.AlternateTripsTitle}
          </div>
          <div className='Trips'>
            {alternateJourneys.map((segments, jindex) => (
              <div className='Trip' key={jindex}>
                <span className='CardIndex'>
                  {jindex + 1}.
                </span>
                {segments.map((segment, index) => (
                  <Segment key={index} segment={segment} />
                ))}
              </div>
            ))}
          </div>
        </div>}
    </div>
  )
}

const Segment = ({segment}) => (
  <span
    className='CardSegment'
    style={{
      backgroundColor: segment.backgroundColor || 'inherit',
      color: segment.color || 'inherit'
    }}
  >
    <i className={`fa fa-${segment.type}`} /> {segment.name}
  </span>
)

function MetricIcon ({name}) {
  switch (name.toLowerCase()) {
    case 'banen': // Dutch for job
    case 'job':
      return <Icon type='building' />
    case 'worker':
    case 'population':
    case 'bewoners': // Dutch for residents
      return <Icon type='child' />
    default:
      return <span />
  }
}

function ShowAccess ({
  accessibility,
  grids
}: {
  accessibility: number[],
  grids: any[],
}) {
  return <div>{grids.map((grid, i) => (
    <div className='Metric' key={grid.name}>
      <MetricIcon name={grid.name} />
      <strong> {(accessibility[i] | 0).toLocaleString()} </strong>{' '}
      {toSpaceCase(grid.name)}
    </div>
  ))}</div>
}

function AccessDiffPercentage ({newAccess, originalAccess}) {
  const actualDiff = newAccess - originalAccess
  const nume = actualDiff > 0
    ? newAccess - originalAccess
    : originalAccess - newAccess
  const diff = parseInt((nume / originalAccess * 100).toFixed(1))
  if (diff === 0 || isNaN(diff)) return <span />
  else if (actualDiff > 0) {
    return (
      <span className='pull-right increase'>
        <strong>{diff}</strong>%<Icon type='level-up' />
      </span>
    )
  } else {
    return (
      <span className='pull-right decrease'>
        <strong>{diff * -1}</strong>
        %
        <Icon className='fa-rotate-180' type='level-up' />
      </span>
    )
  }
}

function ShowDiff ({accessibility, comparison, grids}) {
  return <div>{grids.map((grid, i) => (
    <div className='Metric' key={grid.name}>
      <MetricIcon name={grid.name} />
      <strong> {(accessibility[i] | 0).toLocaleString()} </strong>{' '}
      {toSpaceCase(grid.name)}
      <AccessDiffPercentage
        newAccess={accessibility[i]}
        originalAccess={comparison[i]}
        />
    </div>
  ))}</div>
}
