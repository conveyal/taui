// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import React from 'react'
import toSpaceCase from 'lodash/lowerCase'

type Props = {
  active: boolean,
  alternate: boolean,
  accessibility: number[],
  children?: any,
  grids: any[],
  hasEnd: boolean,
  hasStart: boolean,
  isLoading: boolean,
  oldAccessibility: any,
  oldTravelTime: number,
  onClick(): void,
  routeSegments: any[],
  showComparison: boolean,
  travelTime: number
}

export default class RouteCard extends React.PureComponent {
  props: Props

  render () {
    const {
      active,
      alternate,
      accessibility,
      children,
      grids,
      hasEnd,
      hasStart,
      isLoading,
      oldAccessibility,
      oldTravelTime,
      onClick,
      routeSegments,
      showComparison,
      travelTime
    } = this.props
    return (
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
            {!active && message('Systems.Show')}
          </span>
        </a>
        <div className='CardContent'>
          <div className='CardAccess'>
            <div className='heading'>
              {message('Systems.AccessTitle')}
            </div>
            {!isLoading && hasStart
              ? showComparison
                  ? <ShowDiff
                    accessibility={accessibility}
                    comparison={oldAccessibility}
                    grids={grids}
                    />
                  : <ShowAccess accessibility={accessibility} grids={grids} />
              : <span>{message('Systems.SelectStart')}</span>}
          </div>
          {!isLoading &&
            hasStart &&
            hasEnd &&
            <RouteSegments
              routeSegments={routeSegments}
              oldTravelTime={oldTravelTime}
              travelTime={travelTime}
            />}
        </div>
      </div>
    )
  }
}

function TripDiff ({oldTravelTime, travelTime}) {
  const actualDiff = travelTime - oldTravelTime
  const nume = actualDiff > 0
    ? travelTime - oldTravelTime
    : oldTravelTime - travelTime
  const diff = parseInt((nume / oldTravelTime * 100).toFixed(1))

  if (oldTravelTime === 255) {
    return (
      <span className='increase'>
        {message('NewTrip')} <Icon type='star' />
        <br />
      </span>
    )
  } else if (actualDiff > 0) {
    return (
      <span className='decrease'>
        <strong>{diff}</strong>%<Icon type='level-up' />
        <br />
      </span>
    )
  } else {
    return (
      <span className='increase'>
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
          {message('Systems.TripsTitle')}
        </div>
        <div>
          {message('Systems.SelectEnd')}
        </div>
      </div>
    )
  }

  if (travelTime === 255 || routeSegments.length === 0) {
    return (
      <div className='CardJourneys'>
        <div className='heading'>
          {message('Systems.TripsTitle')}
        </div>
        <div>
          {message('Systems.TripsEmpty')}
        </div>
      </div>
    )
  }

  const [bestJourney, ...alternateJourneys] = routeSegments

  return (
    <div>
      <div className='heading'>
        {message('Systems.BestTripTitle')}
      </div>
      <div className='BestTrip'>
        <div className='Metric'>
          <div className='time'>
            <strong> {travelTime > 120 ? '> 120' : travelTime}</strong>
            {' '}
            {message('Units.Mins')}
          </div>
          <div className='timeDiff'>
            {oldTravelTime &&
              oldTravelTime !== travelTime &&
              <TripDiff
                oldTravelTime={oldTravelTime}
                travelTime={travelTime}
              />}
          </div>
        </div>
        <div className='CardSegments'>
          {bestJourney.map((segment, index) => (
            <Segment key={index} segment={segment} />
          ))}
        </div>
      </div>
      {routeSegments.length > 1 &&
        <div>
          <div className='heading'>
            {message('Systems.AlternateTripsTitle')}
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

function ShowAccess ({
  accessibility,
  grids
}: {
  accessibility: number[],
  grids: any[]
}) {
  return (
    <div>
      {grids.map((grid, i) => (
        <div className='Metric' key={grid.name}>
          <div>
            <Icon type={grid.icon} />
            <strong> {(accessibility[i] | 0).toLocaleString()} </strong>{' '}
            {toSpaceCase(grid.name)}
          </div>
        </div>
      ))}
    </div>
  )
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
      <div className='increase'>
        <strong>{diff}</strong>%<Icon type='level-up' />
      </div>
    )
  } else {
    return (
      <div className='decrease'>
        <strong>{diff * -1}</strong>
        %
        <Icon className='fa-rotate-180' type='level-up' />
      </div>
    )
  }
}

function ShowDiff ({accessibility, comparison, grids}) {
  return (
    <div>
      {grids.map((grid, i) => (
        <div className='Metric' key={grid.name}>
          <div>
            <Icon type={grid.icon} />
            <strong> {(accessibility[i] | 0).toLocaleString()} </strong>{' '}
            {toSpaceCase(grid.name)}
          </div>
          <AccessDiffPercentage
            newAccess={accessibility[i]}
            originalAccess={comparison[i]}
          />
        </div>
      ))}
    </div>
  )
}
