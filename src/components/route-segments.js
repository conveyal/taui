// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'

export default function RouteSegments ({routeSegments, oldTravelTime, travelTime}) {
  if (travelTime === 255 || routeSegments.length === 0) {
    return <div className='alert'>{message('Systems.TripsEmpty')}</div>
  }

  const [bestJourney, ...alternateJourneys] = routeSegments

  return (
    <div>
      <div className='BestTrip'>
        <span className='fa fa-tachometer' />
        <span> Take </span>
        {bestJourney.map((segment, index) => (
          <Segment key={index} segment={segment} />
        ))}
        <span>in </span>
        <strong>{travelTime > 120 ? '> 120' : travelTime}</strong>
        {` ${message('Units.Mins')} `}
        <TripDiff
          oldTravelTime={oldTravelTime}
          travelTime={travelTime}
        />
      </div>
      {routeSegments.length > 1 &&
        <div className='AlternateTrips'>
          <span className='fa fa-map-signs' />
          <span> {message('Systems.AlternateTripsTitle')} </span>
          {alternateJourneys.map((segments, jindex) => (
            <span key={jindex}>
              {segments.map((segment, index) => (
                <Segment key={index} segment={segment} />
              ))}
              {jindex < alternateJourneys.length - 1 && <span>or </span>}
            </span>
          ))}
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

function TripDiff ({oldTravelTime, travelTime}) {
  if (oldTravelTime === 255) {
    return (
      <span className='increase'>
        ({message('NewTrip')} <Icon type='star' />)
      </span>
    )
  }

  const diff = (travelTime - oldTravelTime) / oldTravelTime * 100
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
