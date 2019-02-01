import Icon from '@conveyal/woonerf/components/icon'

import message from '../message'
import {isLight} from '../utils/hex-color-contrast'

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
          {bestJourney.filter(s => s.mode !== 'WALK').map((segment, index) => (
            <Segment key={index} segment={segment} />
          ))}
          {travelTime > 120
            ? <span className='decrease'>inaccessible within 120 minutes</span>
            : <span>in
              <strong> {travelTime}</strong> {message('Units.Mins')}&nbsp;
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
                {segments.filter(s => s.mode !== 'WALK').map((segment, index) => (
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

const getFontColor = backgroundColor => {
  const il = isLight(backgroundColor.substr(1))
  const color = il ? '#000' : '#fff'
  const textShadow = `0 0 1px ${il ? '#fff' : '#000'}`
  return {color, textShadow}
}

const Segment = ({segment}) => (
  <span
    className='CardSegment'
    style={{
      backgroundColor: segment.routeColor,
      ...getFontColor(segment.routeColor)
    }}
    title={segment.name}
  >
    <i className={`fa fa-${segment.mode}`} /> {segment.name}
  </span>
)

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
