import get from 'lodash/get'
import mapboxgl from 'mapbox-gl'
import React from 'react'

import {darkBlue, colors} from '../constants'
import useMap from '../hooks/use-map'

import renderGeoJSONRoutes from '../map/geojson-routes'
import renderIsochrones from '../map/isochrones'
import renderMarker from '../map/marker'
import renderPointsOfInterest from '../map/points-of-interest'

import Icon from './icon'
import MapClickControl from './map-click-control'

import 'mapbox-gl/dist/mapbox-gl.css'

const containerStyle = {height: '100%', width: '100%'}

const legendStyle = {}

// Always use the same markers
const startMarker = new mapboxgl.Marker({color: darkBlue, draggable: true})
const endMarker = new mapboxgl.Marker({color: colors[1].hex, draggable: true})

export default function Map(p) {
  const [map, setMap] = React.useState(null)
  const mapRef = useMap(
    p,
    {
      onClick: p.onMapClick,
      onMove: center => p.updateMap({center}),
      onZoom: zoom => p.updateMap({zoom})
    },
    setMap
  )

  // Use memoized functions. Map only exists once it is loaded.
  if (map) {
    renderMarker(map, startMarker, get(p, 'start.position'), p.updateStart)
    renderMarker(map, endMarker, get(p, 'end.position'), p.updateEnd)
    renderIsochrones(map, p.isochrones)
    renderGeoJSONRoutes(map, p.networkGeoJSONRoutes)
    renderPointsOfInterest(map, p.pointsOfInterest)
  }

  return (
    <>
      <div ref={mapRef} style={containerStyle} />
      <MapClickControl
        clickAction={p.clickAction}
        setClickAction={a => p.updateMap({clickAction: a})}
      />
    </>
  )
}
