import React from 'react'

import {colors} from '../constants'
import message from '../message'

import Alert from './tr-alert'
import Icon from './icon'

export default function RouteSegments(p) {
  if (p.routeSegments.length === 0) {
    return <Alert>{message('Systems.TripsEmpty')}</Alert>
  }

  const rid = i => `route-${p.networkIndex}-${i}`
  const isActive = i => rid(i) === p.activeNetwork

  return (
    <tbody>
      <tr />
      <tr>
        <td>
          <Icon icon='map-marker-alt' style={{color: colors[1].hex}} />
        </td>
        <td>To end</td>
      </tr>
      <tr>
        {p.travelTime > 120 ? (
          <td colSpan='2' className='decrease'>
            Inaccessible within 120 minutes
          </td>
        ) : (
          <>
            <td>Door-to-door</td>
            <td>
              <strong> {p.travelTime}</strong> {message('Units.Minutes')}
            </td>
          </>
        )}
      </tr>
      {p.routeSegments.map((segments, i) => (
        <tr key={`journey-${i}`} onMouseOver={() => p.setActive(rid(i))}>
          <td>
            <Icon
              icon='dot-circle'
              style={{
                opacity: isActive(i) ? 1 : 0.2,
                verticalAlign: 'middle'
              }}
            />{' '}
            Option {i + 1}
          </td>
          <td>
            <Segments segments={segments} />
          </td>
        </tr>
      ))}
    </tbody>
  )
}

function Segments(p) {
  return p.segments
    .filter(s => s.mode !== 'WALK')
    .map((segment, i, segments) => (
      <React.Fragment key={i}>
        <span
          className='CardSegment'
          style={{borderColor: segment.routeColor}}
          title={segment.name}
        >
          <Icon icon={segment.mode} /> {segment.name}
        </span>
        {i !== segments.length - 1 && ' to '}
      </React.Fragment>
    ))
}
