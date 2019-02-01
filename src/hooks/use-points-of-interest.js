import lonlat from '@conveyal/lonlat'
import mapboxgl from 'mapbox-gl'

import useIfExists from './use-if-exists'

export default function usePointsOfInterest (map, poi, onClick) {
  useIfExists(() => {
    const id = 'taui-points-of-interest'
    const source = map.getSource(id)

    if (source) {
      source.setData(poi)
    } else {
      map.addSource(id, {type: 'geojson', data: poi})

      map.addLayer({
        id,
        source: id,
        type: 'circle',
        paint: {
          'circle-radius': 3,
          'circle-color': '#fff',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#000'
        }
      })

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })

      map.on('mouseenter', id, (e) => {
        map.getCanvas().style.cursor = 'pointer'

        const coordinates = e.features[0].geometry.coordinates.slice()
        const description = e.features[0].properties.label

        // Fix for zooming while over feature
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates)
          .setHTML(description)
          .addTo(map)
      })

      map.on('mouseleave', id, () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
    }
  }, [map, poi])
}
