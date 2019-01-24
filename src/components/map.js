import React from 'react'
import ReactMapboxGL, {GeoJSONLayer, ZoomControl} from 'react-mapbox-gl'

import env from '../env'

import {createMarker} from './marker'

const MapboxGL = ReactMapboxGL({
  accessToken: env.MAPBOX_ACCESS_TOKEN,
  dragRotate: false
})

const containerStyle = {
  height: '100%',
  width: '100%'
}

const defaultCenter = [-73.92837524414062, 40.78366099619794]

// Create the start and end markers
const StartMarker = createMarker({
  iconImage: 'map-marker',
  iconSize: 0.07,
  id: 'start-marker'
})
const EndMarker = createMarker({
  iconAnchor: 'center',
  iconImage: 'marker-15',
  id: 'end-marker'
})

export default function Map (p) {
  const [center, setCenter] = React.useState(defaultCenter)

  if (p.center !== center) {
    setCenter(p.center)
  }

  return (
    <MapboxGL
      center={center}
      containerStyle={containerStyle}
      style={p.style}
    >
      <ZoomControl />

      {p.isochrones.filter(Boolean).map((isochrone, index) =>
        <GeoJSONLayer
          before='water-shadow'
          data={isochrone}
          fillPaint={{
            'fill-color': isochrone.style.fillColor,
            'fill-opacity': isochrone.style.fillOpacity
          }}
          key={`isochrone-${index}`}
        />)}

      {p.start &&
        <StartMarker {...p.start} />}

      {p.end &&
        <EndMarker {...p.end} />}
    </MapboxGL>
  )
}
