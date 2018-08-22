// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'

import Alert from './tr-alert'

export default function RouteSegments ({routeSegments, oldTravelTime, travelTime}) {
  if (routeSegments.length === 0) {
    return <Alert>{message('Systems.TripsEmpty')}</Alert>
  }

  const [bestJourney, ...alternateJourneys] = routeSegments

  return (
    <tbody>
      <tr className='BestTrip'>
        <td><span className='fa fa-street-view' /></td>
        <td>
          <span>Take </span>
          {bestJourney.map((segment, index) => (
            <Segment key={index} segment={segment} />
          ))}
          {travelTime > 120
            ? <span className='decrease'>inaccessible within 120 minutes</span>
            : <span>in
              <strong> {travelTime}</strong> {message('Units.Mins')}
              <TripDiff
                baseTravelTime={oldTravelTime}
                travelTime={travelTime}
              />
            </span>}
        </td>
      </tr>
      {routeSegments.length > 1 &&
        <tr className='AlternateTrips'>
          <td><span className='fa fa-map-signs' /></td>
          <td>
            <span>{message('Systems.AlternateTripsTitle')} </span>
            {alternateJourneys.map((segments, jindex) => (
              <span key={jindex}>
                {segments.map((segment, index) => (
                  <Segment key={index} segment={segment} />
                ))}
                {jindex < alternateJourneys.length - 1 && <span>or </span>}
              </span>
            ))}
          </td>
        </tr>}
    </tbody>
  )
}

const Segment = ({segment}) => (
  <span
    className='CardSegment'
    style={{
      backgroundColor: segment.backgroundColor || 'inherit',
      color: segment.color || 'inherit',
      textShadow: `0 0 1px ${segment.color === '#fff' ? '#333' : '#fff'}`
    }}
    title={segment.name}
  >
    <i className={`fa fa-${segment.type}`} /> {segment.name}
  </span>
)

function TripDiff ({baseTravelTime, travelTime}) {
  if (baseTravelTime === 2147483647) {
    return (
      <span className='increase'>&nbsp;({message('NewTrip')} <Icon type='star' />)</span>
    )
  } else if (travelTime === 2147483647) {
    return (
      <span className='decrease'>&nbsp;(<strong>> {120 - baseTravelTime}</strong>% <span className='fa fa-level-up' />)</span>
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
