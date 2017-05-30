// @flow
import React from 'react'
import toSpaceCase from 'lodash/lowerCase'

import {ACCESSIBILITY_IS_EMPTY, ACCESSIBILITY_IS_LOADING} from '../constants'
import Icon from './icon'
import messages from '../utils/messages'

type Props = {
  active: boolean,
  alternate: boolean,
  accessibility: any,
  accessibilityKeys: string[],
  children?: any,
  journeys: any[],
  oldAccessibility: any,
  oldTravelTime: number,
  onClick(): void,
  showComparison: boolean,
  travelTime: number,
  waitTime: number
}

export default (props: Props) => {
  const {
    active,
    alternate,
    accessibility,
    accessibilityKeys,
    children,
    journeys,
    oldAccessibility,
    oldTravelTime,
    onClick,
    showComparison,
    travelTime,
    waitTime
  } = props
  const className =
    'Card' +
    (alternate ? ' Card-alternate' : '') +
    (active ? ' Card-active' : '')

  return (
    <div className={className}>
      <a
        className='CardTitle'
        onClick={onClick}
        tabIndex={0}
        title='Set system active'
      >
        {children}
        <span className='pull-right'>
          {active && <Icon type='map' />}
          {!active && messages.Systems.Show}
        </span>
      </a>
      <div className='CardContent'>
        {showComparison
          ? <ShowDiff
            keys={accessibilityKeys}
            base={accessibility}
            comparison={oldAccessibility}
            />
          : <ShowAccess keys={accessibilityKeys} base={accessibility} />}
        {accessibility !== ACCESSIBILITY_IS_EMPTY &&
          accessibility !== ACCESSIBILITY_IS_LOADING &&
          <Journeys
            journeys={journeys}
            oldTravelTime={oldTravelTime}
            travelTime={travelTime}
            waitTime={waitTime}
          />}
      </div>
    </div>
  )
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
        {messages.NewTrip} <Icon type='star' /><br />
      </span>
    )
  } else if (actualDiff > 0) {
    return (
      <span className='pull-right decrease'>
        <strong>{diff}</strong>%<Icon type='level-up' /><br />
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

function Journeys ({journeys, oldTravelTime, travelTime, waitTime}) {
  if (!travelTime || !journeys) {
    return (
      <div className='CardJourneys'>
        <div className='heading'>{messages.Systems.TripsTitle}</div>
        <div>{messages.Systems.SelectEnd}</div>
      </div>
    )
  }

  if (travelTime === 255 || journeys.length === 0) {
    return (
      <div className='CardJourneys'>
        <div className='heading'>{messages.Systems.TripsTitle}</div>
        <div>{messages.Systems.TripsEmpty}</div>
      </div>
    )
  }

  const [bestJourney, ...alternateJourneys] = journeys

  return (
    <div>
      <div className='heading'>{messages.Systems.BestTripTitle}</div>
      <div className='BestTrip'>
        <div><strong> {travelTime}</strong> {messages.Units.Mins}</div>
        <div>
          {oldTravelTime &&
            oldTravelTime !== travelTime &&
            <TripDiff oldTravelTime={oldTravelTime} travelTime={travelTime} />}
        </div>
        <div>
          <strong>{waitTime}</strong>
          {' '}
          {messages.Units.Mins}
          {' '}
          {messages.Systems.Waiting}
        </div>
        <div>{bestJourney.map((segment, index) =>
          <Segment key={index} segment={segment} />)}</div>
      </div>
      {journeys.length > 1 &&
        <div>
          <div className='heading'>{messages.Systems.AlternateTripsTitle}</div>
          <div className='Trips'>{alternateJourneys.map((segments, jindex) =>
            <div className='Trip' key={jindex}>
              <span className='CardIndex'>{jindex + 1}.</span>{segments.map((segment, index) =>
                <Segment key={index} segment={segment} />)}
            </div>
          )}</div>
        </div>}
    </div>
  )
}

const Segment = ({segment}) =>
  <span
    className='CardSegment'
    style={{
      backgroundColor: segment.backgroundColor || 'inherit',
      color: segment.color || 'inherit'
    }}
  >
    <i className={`fa fa-${segment.type}`} /> {segment.name}
  </span>

function MetricIcon ({name}) {
  const lc = name.toLowerCase()
  if (lc.indexOf('job') !== -1) return <Icon type='building' />
  if (lc.indexOf('worker') !== -1 || lc.indexOf('population') !== -1) {
    return <Icon type='child' />
  }
  return <span />
}

function ShowAccess ({keys, base}: {
  keys: string[],
  base: {
    [name: string]: number
  }
}) {
  return (
    <div className='CardAccess'>
      <div className='heading'>{messages.Systems.AccessTitle}</div>
      {base === ACCESSIBILITY_IS_EMPTY
        ? <span>{messages.Systems.SelectStart}</span>
        : base === ACCESSIBILITY_IS_LOADING
            ? <span>{messages.Systems.CalculatingAccessibility}</span>
            : keys.map((k, i) => (
              <div className='Metric' key={k}>
                <MetricIcon name={k} />
                <strong> {(base[k] | 0).toLocaleString()} </strong>
                {' '}
                {toSpaceCase(k)}
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
  if (diff === 0) return <span />
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

function ShowDiff ({keys, base, comparison}) {
  return (
    <div className='CardAccess'>
      <div className='heading'>{messages.Systems.AccessTitle}</div>
      {base === ACCESSIBILITY_IS_EMPTY
        ? <span>{messages.Systems.SelectStart}</span>
        : base === ACCESSIBILITY_IS_LOADING
            ? <span>{messages.Systems.CalculatingAccessibility}</span>
            : keys.map((key, i) => (
              <div className='Metric' key={key}>
                <MetricIcon name={key} />
                <strong> {(base[key] | 0).toLocaleString()} </strong>
                {' '}
                {toSpaceCase(key)}
                <AccessDiffPercentage
                  newAccess={base[key]}
                  originalAccess={comparison[key]}
                  />
              </div>
              ))}
    </div>
  )
}
