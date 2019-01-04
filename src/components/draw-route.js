// @flow
import React from 'react'
import {CircleMarker, LayerGroup, Polyline} from 'react-leaflet'

export default class DrawRoute extends React.PureComponent {
  render () {
    const p = this.props
    return <LayerGroup>
      {p.segments.map((segment, i) => {
        if (segment.type === 'WALK') {
          return <Polyline
            className='WalkSegment'
            key={`walk-segment-${i}`}
            positions={segment.positions}
            {...p.walkStyle}
          />
        } else {
          return <Polyline
            className='TransitSegment'
            key={`transit-segment-${i}`}
            {...p.transitStyle}
            positions={segment.positions}
            color={segment.color}
          />
        }
      })}
      {p.stops.map((s, i) =>
        <CircleMarker
          className='Stop'
          key={`stop-${i}`}
          center={s}
          {...p.stopStyle}
        />)}
    </LayerGroup>
  }
}
