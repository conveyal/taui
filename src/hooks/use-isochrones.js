import toKebabCase from 'lodash/kebabCase'
import reverse from 'lodash/reverse'

import useIfExists from './use-if-exists'

const EmptyCollection = {type: 'FeatureCollection', features: []}

export default function useIsochrones (map, isochrones) {
  useIfExists(() => {
    // Reverse to add the top layer first so that we can insert subsequent
    // layers beneath.
    reverse(isochrones).forEach((isochrone, i) => {
      const id = `isochrone-${i}`
      const data = isochrone || EmptyCollection
      const source = map.getSource(id)

      if (source) {
        source.setData(data)
      } else {
        map.addSource(id, {type: 'geojson', data})

        const beforeLayer = i === 0
          ? 'road-label'
          : `isochrone-${i - 1}`

        // Fill the base layer
        if (i === isochrones.length - 1) {
          map.addLayer({
            id,
            source: id,
            type: 'fill',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': ['get', 'opacity']
            }
          }, 'waterway')
        } else {
          map.addLayer({
            id,
            source: id,
            type: 'line',
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': ['get', 'color'],
              'line-opacity': ['get', 'opacity'],
              'line-width': ['get', 'width']
            }
          }, beforeLayer)
        }
      }
    })
  }, [map, isochrones])
}
