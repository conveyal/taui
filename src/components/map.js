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
        <div className={`mapboxgl-ctrl ${p.clickAction}`}>
          <div>click map to:</div>
          <div
            className='startButton'
            onClick={() => p.updateMap({clickAction: 'start'})}
          >
            <Icon
              icon='map-marker-alt'
              color={p.clickAction === 'start' ? 'white' : darkBlue}
              transform='shrink-4'
            />
            &nbsp;set start
          </div>
          <div
            className='endButton'
            onClick={() => p.updateMap({clickAction: 'end'})}
          >
            <Icon
              icon='map-marker-alt'
              color={p.clickAction === 'end' ? 'white' : colors[1].hex}
              transform='shrink-4'
            />
            &nbsp;set end
          </div>
        </div>
        <style jsx>{`
          .mapboxgl-ctrl {
            padding: 0 4px 4px 4px;
            margin-bottom: 25px;
            background-color: #fff;
            border-radius: 4px;
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
            text-align: center;
          }

          .mapboxgl-ctrl > div {
            padding: 5px 13px;
            margin-top: 4px;
            border-radius: 100px;
          }

          .mapbox-ctrl > div > .svg-inline--fa {
            display: inline-block;
            margin-bottom: -1.5px;
          }

          .end > .startButton:hover,
          .start > .endButton:hover {
            background-color: rgba(0, 0, 0, 0.05);
            cursor: pointer;
          }

          .end > .endButton {
            background-color: ${colors[1].hex};
            color: white;
          }

          .start > .startButton {
            background-color: ${darkBlue};
            color: white;
          }
        `}</style>
      </div>
    </>
  )
}
