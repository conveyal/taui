import lonlat from '@conveyal/lonlat'
import once from 'lodash/once'
import memoize from 'memoize-one'

/**
 * Create a marker based on the marker props. Update the position on drag end.
 */
export default function createRenderMarker(marker) {
  const initializeOnce = once(function initialize(marker, setPosition) {
    marker.on('dragend', () => {
      setPosition({
        position: lonlat(marker.getLngLat())
      })
    })
  })

  return memoize(function renderMarker(map, position, setPosition) {
    initializeOnce(marker, setPosition)

    if (position) {
      marker.setLngLat(position).addTo(map)
    } else {
      marker.remove()
    }
  })
}
