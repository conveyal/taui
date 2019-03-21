import once from 'lodash/once'
import mapboxgl from 'mapbox-gl'
import memoize from 'memoize-one'

import {POI_ID as ID} from '../constants'

const EmptyCollection = {type: 'FeatureCollection', features: []}

const initializeOnce = once(initializePoi)

export default memoize(function usePointsOfInterest(map, poi) {
  initializeOnce(map, poi)

  const source = map.getSource(ID)
  if (source) source.setData(poi || EmptyCollection)
})

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
