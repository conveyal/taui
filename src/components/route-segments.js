import Icon from '@conveyal/woonerf/components/icon'
import uniqBy from 'lodash/uniqBy'

import message from '../message'

import Alert from './tr-alert'

export default function RouteSegments (p) {
  if (p.routeSegments.length === 0) {
    return <Alert>{message('Systems.TripsEmpty')}</Alert>
  }

  const [bestJourney, ...alternateJourneys] = uniqBy(
    p.routeSegments,
    r => r.map(s => s.name).join('-')
  )

  return (
    <tbody>
      <tr className='BestTrip'>
        <td><span className='fa fa-clock-o' /></td>
        <td>
          {p.travelTime > 120
            ? <span className='decrease'>Inaccessible within 120 minutes</span>
            : <React.Fragment>Trip duration
              <strong> {p.travelTime}</strong> {message('Units.Mins')}&nbsp;
              <TripDiff
                baseTravelTime={p.oldTravelTime}
                travelTime={p.travelTime}
              />
            </React.Fragment>}
        </td>
      </tr>
      <tr>
        <td>{p.active && <span className='fa fa-street-view' />}</td>
        <td>Take <Segments segments={bestJourney} /></td>
      </tr>
      {alternateJourneys.length > 0 &&
        <tr>
          <td></td>
          <td>
            {message('Systems.AlternateTripsTitle')}&nbsp;
            {alternateJourneys.map((segments, i) =>
              <React.Fragment key={i}>
                <Segments segments={segments} />
                {i < alternateJourneys.length - 1 && ' or '}
              </React.Fragment>
            )}
          </td>
        </tr>}
    </tbody>
  )
}

function Segments (p) {
  return p.segments.filter(s => s.mode !== 'WALK')
    .map((segment, i, segments) =>
      <React.Fragment key={i}>
        <span
          className='CardSegment'
          style={{borderColor: segment.routeColor}}
          title={segment.name}
        >
          <i className={`fa fa-${segment.mode}`} /> {segment.name}
        </span>
        {i !== (segments.length - 1) && ' to '}
      </React.Fragment>
    )
}

function TripDiff ({baseTravelTime, travelTime}) {
  if (baseTravelTime === 2147483647) {
    return (
      <span className='increase'>({message('NewTrip')} <Icon type='star' />)</span>
    )
  } else if (travelTime === 2147483647) {
    return (
      <span className='decrease'>(<strong>> {120 - baseTravelTime}</strong>% <span className='fa fa-level-up' />)</span>
    )
  }

  const diff = (travelTime - baseTravelTime) / baseTravelTime * 100
  if (isNaN(diff) || Math.abs(diff) < 0.1) return null

  if (diff > 0) {
    return (
      <span className='decrease'>
        (<strong>{diff.toFixed(1)}</strong>% <span className='fa fa-level-up' />)
      </span>
    )
  }

  return (
    <span className='increase'>
      (<strong>{diff.toFixed(1)}</strong>% <span className='fa fa-level-up fa-rotate-180' />)
    </span>
  )
}
