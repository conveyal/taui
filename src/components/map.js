import get from 'lodash/get'
import React from 'react'

import {darkBlue, colors} from '../constants'
import useGeoJSONRoutes from '../hooks/use-geojson-routes'
import useIsochrones from '../hooks/use-isochrones'
import useMap from '../hooks/use-map'
import useMarker from '../hooks/use-marker'
import usePointsOfInterest from '../hooks/use-points-of-interest'

import Icon from './icon'

import 'mapbox-gl/dist/mapbox-gl.css'

const containerStyle = {height: '100%', width: '100%'}

const legendStyle = {
  backgroundColor: '#fff',
  borderRadius: '4px',
  boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer'
}

const legendButtonStyle = {
  padding: '10px'
}

// Always use the same markers
const startMarkerProps = {color: darkBlue}
const endMarkerProps = {color: colors[1].hex}

export default function Map(p) {
  const [mapRef, map] = useMap(p, {
    onClick: p.onMapClick,
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

  return (
    <>
      <div ref={mapRef} style={containerStyle} />
      <div className='mapboxgl-ctrl-bottom-right'>
        <div className='mapboxgl-ctrl' style={legendStyle}>
          <div
            className={p.clickAction === 'start' ? 'active' : ''}
            style={legendButtonStyle}
            onClick={() => p.updateMap({clickAction: 'start'})}
          >
            <Icon icon='map-marker-alt' />&nbsp;&nbsp;set start
          </div>
          <div
            className={p.clickAction === 'end' ? 'active' : ''}
            style={legendButtonStyle}
            onClick={() => p.updateMap({clickAction: 'end'})}
          >
            <Icon icon='map-marker-alt' color={colors[1].hex} />&nbsp;&nbsp;set end
          </div>
        </div>
        <style jsx>{`
          .mapboxgl-ctrl > div {
            opacity: 0.5;
          }

          .mapboxgl-ctrl > div:hover {
            background-color: rgba(0, 0, 0, 0.05);
            opacity: 1;
          }

          .mapboxgl-ctrl > div.active {
            opacity: 1;
          }

          .mapboxgl-ctrl > div + div {
            border-top: 1px solid #ddd;
          }
        `}</style>
      </div>
    </>
  )
}
