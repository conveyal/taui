import React from 'react'

import useOnLoad from './use-on-load'

/**
 * Isochrones are in reverse order of the networks.
 */
export default function useIsochrones (map, isochrones) {
  useOnLoad(initializeIsochrones, map, [isochrones])

  React.useEffect(
    () => {
      if (!map) return

      isochrones.forEach((isochrone, i) => {
        const source = map.getSource(isochrone.properties.id)
        if (source) source.setData(isochrone)
      })
    },
    [map, isochrones]
  )
}

function initializeIsochrones (map, isochrones) {
  isochrones.forEach((isochrone, i) => {
    const id = isochrone.properties.id
    map.addSource(id, { type: 'geojson', data: isochrone })

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
