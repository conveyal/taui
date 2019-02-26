import lonlat from '@conveyal/lonlat'
import mapboxgl from 'mapbox-gl'
import React from 'react'

/**
 * Create a marker based on the marker props. Update the position on drag end.
 */
export default function useMarker (markerProps, map, position, events) {
  const [marker, setMarker] = React.useState(() => new mapboxgl.Marker({
    draggable: true,
    ...markerProps
  }))

  const onDragEnd = React.useCallback(() =>
    events.onDragEnd(lonlat(marker.getLngLat())))

  React.useEffect(() => {
    marker.on('dragend', onDragEnd)
    return () => marker.off('dragend', onDragEnd)
  }, [marker])

  React.useEffect(() => {
    if (!map) return

    if (position) {
      marker
        .setLngLat(position)
        .addTo(map)
    } else {
      marker.remove()
    }
  }, [map, position])

  return marker
}
