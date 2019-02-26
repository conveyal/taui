import reverse from 'lodash/reverse'
import React from 'react'

import useOnLoad from './use-on-load'

const EmptyCollection = {type: 'FeatureCollection', features: []}
const getId = i => `isochrone-${i}`

export default function useIsochrones (map, isochrones) {
  // Reverse to add the top layer first so that we can insert subsequent
  // layers beneath. Use consistently for ID purposes.
  const forEachIso = fn => reverse(isochrones).forEach(fn)

  React.useEffect(() => {
    if (!map) return

    forEachIso((isochrone, i) => {
      const source = map.getSource(getId(i))
      if (source) source.setData(isochrone || EmptyCollection)
    })
  }, [map, isochrones])

  useOnLoad(() => {
    forEachIso((isochrone, i) => {
      const id = `isochrone-${i}`
      const data = isochrone || EmptyCollection

      map.addSource(id, {type: 'geojson', data})

      const beforeLayer = i === 0
        ? 'waterway'
        : `isochrone-${i - 1}`

      // Fill the base layer
      map.addLayer({
        id,
        source: id,
        type: 'fill',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['get', 'opacity']
        }
      }, beforeLayer)
    })
  }, map)
}
