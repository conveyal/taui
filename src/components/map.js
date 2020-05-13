import lonlat from '@conveyal/lonlat'
import get from 'lodash/get'
import mapboxgl from 'mapbox-gl'
import React from 'react'

import {darkBlue, colors, POI_ID} from '../constants'
import useMap from '../hooks/use-map'

import MapClickControl from './map-click-control'

import 'mapbox-gl/dist/mapbox-gl.css'

const EmptyCollection = {type: 'FeatureCollection', features: []}

const containerStyle = {height: '100%', width: '100%'}

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

  const {activeNetwork, isochrones, networkGeoJSONRoutes, pointsOfInterest} = p

  // Render isochrones
  React.useEffect(() => {
    if (!map) return
    renderIsochronesOnMap(isochrones, map)
  }, [map, isochrones])

  // Render GeoJSON routes
  React.useEffect(() => {
    if (!map) return

    networkGeoJSONRoutes.forEach((routes, i) =>
      renderRoutesOnMap(routes, i, activeNetwork, map)
    )

    return () => {
      networkGeoJSONRoutes.forEach((routes, networkIndex) =>
        routes.forEach((r, i) => {
          const id = `route-${networkIndex}-${i}`
          const source = map.getSource(id)
          if (source) return source.setData(EmptyCollection)
        })
      )
    }
  }, [map, networkGeoJSONRoutes, activeNetwork])

  // Render POI Data
  React.useEffect(() => {
    if (!map) return
    // As POIs are set at build this function will only be run once
    renderPointsOfInterestOnMap(pointsOfInterest, map)
  }, [map, pointsOfInterest])

  // Use memoized functions. Map only exists once it is loaded.
  if (map) {
    // renderStartMarker(map, get(p, 'start.position'), p.updateStart)
    // renderEndMarker(map, get(p, 'end.position'), p.updateEnd)
  }

  // Initialize markers
  const {updateEnd, updateStart} = p
  React.useEffect(() => {
    if (!map) return
    startMarker.on('dragend', () => {
      updateStart({
        position: lonlat(startMarker.getLngLat())
      })
    })

    endMarker.on('dragend', () => {
      updateEnd({
        position: lonlat(endMarker.getLngLat())
      })
    })
  }, [map, updateEnd, updateStart])

  // Update positions
  const startPosition = get(p, 'start.position')
  const endPosition = get(p, 'end.position')
  React.useEffect(() => {
    if (!map) return

    if (startPosition) {
      startMarker.setLngLat(startPosition).addTo(map)
    } else {
      startMarker.remove()
    }
  }, [map, startPosition])
  React.useEffect(() => {
    if (!map) return

    if (endPosition) {
      endMarker.setLngLat(endPosition).addTo(map)
    } else {
      endMarker.remove()
    }
  }, [map, endPosition])

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

function renderIsochronesOnMap(isochrones, map) {
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
}

// Remove indexes of routest that are no longer displayed
const lastRouteCount = []

function renderRoutesOnMap(routes, networkIndex, activeNetwork, map) {
  routes.forEach((featureCollection, i) => {
    const id = `route-${networkIndex}-${i}`
    // Remove id

    // Hide non-active networks
    if (typeof activeNetwork === 'string' && id !== activeNetwork) {
      featureCollection = EmptyCollection
    }

    const source = map.getSource(id)
    if (source) return source.setData(featureCollection)

    map.addSource(id, {
      type: 'geojson',
      data: featureCollection
    })

    map.addLayer(
      {
        id: `${id}-walk`,
        source: id,
        type: 'line',
        paint: {
          'line-color': '#000',
          'line-dasharray': [1, 1],
          'line-width': 5
        },
        filter: ['==', 'mode', 'WALK']
      },
      'road-label'
    )

    map.addLayer(
      {
        id: `${id}-transit-shadow`,
        source: id,
        type: 'line',
        paint: {
          'line-color': '#000',
          'line-width': 1,
          'line-gap-width': 3
        },
        filter: ['all', ['!=', 'mode', 'WALK'], ['==', '$type', 'LineString']]
      },
      'road-label'
    )

    map.addLayer(
      {
        id: `${id}-transit`,
        source: id,
        type: 'line',
        paint: {
          'line-color': ['get', 'routeColor'],
          'line-width': 3
        },
        filter: ['all', ['!=', 'mode', 'WALK'], ['==', '$type', 'LineString']]
      },
      'road-label'
    )
  })

  // Remove unused routes
  const lrt = lastRouteCount[networkIndex] || 0
  for (let i = routes.length; i < lrt; i++) {
    const id = `route-${networkIndex}-${i}`
    const source = map.getSource(id)
    if (source) return source.setData(EmptyCollection)
  }
  lastRouteCount[networkIndex] = routes.length
}

function renderPointsOfInterestOnMap(poi, map) {
  const source = map.getSource(POI_ID)
  if (source) return source.setData(poi || EmptyCollection)

  map.addSource(POI_ID, {type: 'geojson', data: poi || EmptyCollection})

  map.addLayer({
    id: POI_ID,
    source: POI_ID,
    type: 'symbol',
    layout: {
      'icon-image': 'stroked-circle',
      'icon-size': 0.11
    }
  })

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  })

  map.on('mouseenter', POI_ID, e => {
    map.getCanvas().style.cursor = 'pointer'

    const coordinates = e.features[0].geometry.coordinates.slice()
    const description = e.features[0].properties.label

    // Fix for zooming while over feature
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
    }

    popup
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map)
  })

  map.on('mouseleave', POI_ID, () => {
    map.getCanvas().style.cursor = ''
    popup.remove()
  })
}
