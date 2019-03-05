import mapboxgl from 'mapbox-gl'
import React from 'react'

import {POI_ID as ID} from '../constants'

import useOnLoad from './use-on-load'

const EmptyCollection = {type: 'FeatureCollection', features: []}

export default function usePointsOfInterest(map, poi) {
  useOnLoad(initializePoi, map, [poi])

  React.useEffect(() => {
    if (!map) return
    const source = map.getSource(ID)
    if (source) source.setData(poi || EmptyCollection)
  }, [map, poi])
}

function initializePoi(map, poi) {
  map.addSource(ID, {type: 'geojson', data: poi || EmptyCollection})

  map.addLayer({
    id: ID,
    source: ID,
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

  map.on('mouseenter', ID, e => {
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

  map.on('mouseleave', ID, () => {
    map.getCanvas().style.cursor = ''
    popup.remove()
  })
}
