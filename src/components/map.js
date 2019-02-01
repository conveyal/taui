import get from 'lodash/get'
import mapboxgl from 'mapbox-gl'
import React from 'react'

import {darkBlue, colors} from '../constants'
import env from '../env'
import useGeoJSONRoutes from '../hooks/use-geojson-routes'
import useIfExists from '../hooks/use-if-exists'
import useIsochrones from '../hooks/use-isochrones'
import useMap from '../hooks/use-map'
import useMarker from '../hooks/use-marker'
import usePointsOfInterest from '../hooks/use-points-of-interest'

// Set the token from `env`
mapboxgl.accessToken = env.MAPBOX_ACCESS_TOKEN

const containerStyle = {height: '100%', width: '100%'}

// Always use the same markers
const startMarkerProps = {color: darkBlue}
const endMarkerProps = {color: colors[1].hex}

export default function Map (p) {
  const [mapRef, map] = useMap(p, {
    onClick: position => p.start ? p.updateEnd({position}) : p.updateStart({position}),
    onMove: center => p.updateMap({center}),
    onZoom: zoom => p.updateMap({zoom})
  })

  useMarker(startMarkerProps, map, get(p, 'start.position'), {
    onDragEnd: position => p.updateStart({position})
  })
  useMarker(endMarkerProps, map, get(p, 'end.position'), {
    onDragEnd: position => p.updateEnd({position})
  })
  useIsochrones(map, [...p.isochrones, p.isochroneOutline])
  useGeoJSONRoutes(map, p.networkGeoJSONRoutes)
  usePointsOfInterest(map, p.pointsOfInterest, p.updateStart)

  return <div ref={mapRef} style={containerStyle} />
}
