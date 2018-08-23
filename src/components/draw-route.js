// @flow
import polyline from '@mapbox/polyline'
import React from 'react'
import {CircleMarker, LayerGroup, Polyline} from 'react-leaflet'

const WALK_STYLE = {
  color: '#333',
  dashArray: '5, 5',
  lineCap: 'butt',
  lineMeter: 'miter',
  weight: 5
}

const TRANSIT_STYLE = {
  color: 'green',
  weight: 5
}

const STOP_STYLE = {
  color: '#333',
  fill: true,
  fillColor: '#fff',
  fillOpacity: 1,
  radius: 3,
  weight: 2
}

export default class DrawRoute extends React.PureComponent {
  _findPositionsForWalk (segment) {
    const t = this.props.transitive
    function ll (l) {
      if (l.place_id) {
        const p = t.places.find(p => p.place_id === l.place_id)
        return [p.place_lat, p.place_lon]
      }
      const s = t.stops.find(s => s.stop_id === l.stop_id)
      return [s.stop_lat, s.stop_lon]
    }
    return [ll(segment.from), ll(segment.to)]
  }

  _findPositionsForTransit (segment) {
    const t = this.props.transitive
    const p = t.patterns.find(p => segment.pattern_id === p.pattern_id)
    const stops = p.stops.slice(segment.from_stop_index, segment.to_stop_index)
    return stops.reduce((lls, s) =>
      [...lls, ...polyline.decode(s.geometry)], [])
  }

  _getSegmentColor (segment) {
    const t = this.props.transitive
    const p = t.patterns.find(p => segment.pattern_id === p.pattern_id)
    const r = t.routes.find(r => p.route_id === r.route_id)
    return r && r.route_color ? `#${r.route_color}` : '#333'
  }

  _getStopPosition (pid, sindex) {
    const t = this.props.transitive
    const p = t.patterns.find(p => pid === p.pattern_id)
    const sid = p.stops[sindex].stop_id
    const stop = t.stops.find(s => sid === s.stop_id)
    return [stop.stop_lat, stop.stop_lon]
  }

  render () {
    const t = this.props.transitive
    const j = t.journeys[0]
    return <LayerGroup>
      {j.segments.map((segment, i) => {
        if (segment.type === 'WALK') {
          return <Polyline
            className='WalkSegment'
            key={`walk-segment-${i}`}
            positions={this._findPositionsForWalk(segment)}
            {...WALK_STYLE}
          />
        } else {
          return <Polyline
            className='TransitSegment'
            key={`transit-segment-${i}`}
            {...TRANSIT_STYLE}
            positions={this._findPositionsForTransit(segment)}
            color={this._getSegmentColor(segment)}
          />
        }
      })}
      {j.segments
        .filter(s => s.type === 'TRANSIT')
        .reduce((stops, s, i) => [
          ...stops,
          this._getStopPosition(s.pattern_id, s.from_stop_index),
          this._getStopPosition(s.pattern_id, s.to_stop_index)
        ], [])
        .map((s, i) =>
          <CircleMarker className='Stop' key={`stop-${i}`} center={s} {...STOP_STYLE} />)}
    </LayerGroup>
  }
}
