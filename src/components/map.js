import get from 'lodash/get'
import mapboxgl from 'mapbox-gl'
import React from 'react'

import {darkBlue, colors} from '../constants'
import useMap from '../hooks/use-map'

import renderGeoJSONRoutes from '../map/geojson-routes'
import createRenderMarker from '../map/marker'
import renderPointsOfInterest from '../map/points-of-interest'

import MapClickControl from './map-click-control'

import 'mapbox-gl/dist/mapbox-gl.css'

const containerStyle = {height: '100%', width: '100%'}

// Always use the same markers
const startMarker = new mapboxgl.Marker({color: darkBlue, draggable: true})
const endMarker = new mapboxgl.Marker({color: colors[1].hex, draggable: true})
const renderStartMarker = createRenderMarker(startMarker)
const renderEndMarker = createRenderMarker(endMarker)

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

  // Render isochrones
  const {isochrones} = p
  React.useEffect(() => {
    if (!map) return

    isochrones.forEach((isochrone, i) => {
      const source = map.getSource(isochrone.properties.id)
      if (source) return source.setData(isochrone)

      const id = isochrone.properties.id
      map.addSource(id, {type: 'geojson', data: isochrone})

      const beforeLayer = i === 0 ? 'waterway' : isochrones[i - 1].properties.id

      // Fill the base layer
      map.addLayer(
        {
          id,
          source: id,
          type: 'fill',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['get', 'opacity']
          }
        },
        beforeLayer
      )
    })
  }, [map, isochrones])

  // Use memoized functions. Map only exists once it is loaded.
  if (map) {
    renderStartMarker(map, get(p, 'start.position'), p.updateStart)
    renderEndMarker(map, get(p, 'end.position'), p.updateEnd)
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
