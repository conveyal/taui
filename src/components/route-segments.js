// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'

export default function RouteSegments ({routeSegments, oldTravelTime, travelTime}) {
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
