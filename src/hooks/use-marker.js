import lonlat from '@conveyal/lonlat'
import throttle from 'lodash/throttle'
import mapboxgl from 'mapbox-gl'
import React from 'react'

import useIfExists from './use-if-exists'

/**
 * Create a marker based on the marker props. Update the position on drag end.
 */
export default function useMarker (markerProps, map, position, events) {
  const [marker, setMarker] = React.useState(() => new mapboxgl.Marker({
    draggable: true,
    ...markerProps
  }))

  const onDragEnd = React.useCallback(() =>
    events.onDragEnd(lonlat(marker.getLngLat()))
  , [marker])

  useIfExists(() => {
    if (position) {
      marker
        .on('dragend', onDragEnd)
        .setLngLat(position)
        .addTo(map)
    } else {
      marker
        .off('dragend', onDragEnd)
        .remove()
    }
  }, [map], [position])

  return marker
}
