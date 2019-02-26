import get from 'lodash/get'
import React from 'react'

import {darkBlue, colors} from '../constants'
import useGeoJSONRoutes from '../hooks/use-geojson-routes'
import useIfExists from '../hooks/use-if-exists'
import useIsochrones from '../hooks/use-isochrones'
import useMap from '../hooks/use-map'
import useMarker from '../hooks/use-marker'
import usePointsOfInterest from '../hooks/use-points-of-interest'

const containerStyle = {height: '100%', width: '100%'}

// Always use the same markers
const startMarkerProps = {color: darkBlue}
const endMarkerProps = {color: colors[1].hex}

export default function Map (p) {
  const [mapRef, map] = useMap(p, {
    onClick: d => p.start ? p.updateEnd(d) : p.updateStart(d),
    onMove: center => p.updateMap({center}),
    onZoom: zoom => p.updateMap({zoom})
  })

  useMarker(startMarkerProps, map, get(p, 'start.position'), {
    onDragEnd: position => p.updateStart({position})
  })
  useMarker(endMarkerProps, map, get(p, 'end.position'), {
    onDragEnd: position => p.updateEnd({position})
  })
  useIsochrones(map, p.isochrones)
  useGeoJSONRoutes(map, p.networkGeoJSONRoutes)
  usePointsOfInterest(map, p.pointsOfInterest)

  return <div ref={mapRef} style={containerStyle} />
}
