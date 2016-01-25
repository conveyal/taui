import React, {Component, PropTypes} from 'react'
import {Map as BaseMap, TileLayer} from 'react-leaflet'

export default class Map extends Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.any,
    map: PropTypes.object,
    onChange: PropTypes.func,
    onClick: PropTypes.func
  };

  render () {
    const {children, map, onChange, onClick} = this.props
    const {attribution, center, zoom} = map

    return (
      <BaseMap
        center={center}
        zoom={zoom}
        onLeafletClick={onClick}
        onLeafletZoomEnd={e => onChange({ zoom: e.target._zoom })}
        {...this.props}>
        <TileLayer
          url={map.url}
          attribution={attribution}
        />
        {children}
      </BaseMap>
    )
  }
}
