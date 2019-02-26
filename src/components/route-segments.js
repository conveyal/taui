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
          {travelTime > 120
            ? <span className='decrease'>Inaccessible within 120 minutes</span>
            : <span>Trip duration
              <strong> {travelTime}</strong> {message('Units.Mins')}&nbsp;
              <TripDiff
                baseTravelTime={oldTravelTime}
                travelTime={travelTime}
              />
            </span>}
        </td>
      </tr>
      <tr>
        <td></td>
        <td>Take <Segments segments={bestJourney} /></td>
      </tr>
      {routeSegments.length > 1 &&
        <tr>
          <td></td>
          <td>
            <span>{message('Systems.AlternateTripsTitle')} </span>
            {alternateJourneys.map((segments, i) =>
              <span key={i}>
                <Segments segments={segments} />
                {i < alternateJourneys.length - 1 && 'or '}
              </span>
            )}
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

function Segments (p) {
  return p.segments.filter(s => s.mode !== 'WALK')
    .map((segment, i, segments) =>
      <span key={i}>
        <Segment segment={segment} />
        {i !== (segments.length - 1) && 'to '}
      </span>
    )
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
