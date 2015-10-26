import React from 'react'
import {Map as BaseMap, TileLayer} from 'react-leaflet'

const ATTRIBUTION = `&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`

const Map = ({className, children, map, onChange, onClick}) => {
  const url = `http://api.tiles.mapbox.com/v4/${map.mapbox.map}/{z}/{x}/{y}.png?access_token=${map.mapbox.accessToken}`

  return (
    <BaseMap
      center={map.center}
      className={className}
      zoom={map.zoom}
      onLeafletClick={onClick}
      // onLeafletMoveEnd={e => onChange({ center: e.target.options.center })}
      onLeafletZoomEnd={e => onChange({ zoom: e.target._zoom })}>
      <TileLayer
        url={url}
        attribution={ATTRIBUTION}
      />
      {children}
    </BaseMap>
  )
}

export default Map
