import lonlat from '@conveyal/lonlat'
import mapboxgl from 'mapbox-gl'
import React from 'react'

// Default NavigationControl
const navControl = new mapboxgl.NavigationControl({showCompass: false})

export default function useMap (mapProps, events) {
  const [center, setCenter] = React.useState(mapProps.center)
  const [style, setStyle] = React.useState(mapProps.style)
  const [zoom, setZoom] = React.useState(mapProps.zoom)
  const ref = React.useRef(null)
  const map = React.useRef(null)

  // Runs on mount
  React.useEffect(() => {
    const m = map.current = window.map = new mapboxgl.Map({
      center,
      container: ref.current,
      maxBounds: mapProps.maxBounds,
      minZoom: mapProps.minZoom,
      style,
      zoom
    })

    m.on('load', () => m.addControl(navControl, 'top-right'))
    m.on('click', e => events.onClick(lonlat(e.lngLat)))
    m.on('moveend', () => events.onMove(lonlat(m.getCenter())))
    m.on('zoomend', () => events.onZoom(m.getZoom()))

    return () => {
      if (map.current) map.current.remove()
      map.current = null
    }
  }, [ref])

  return [ref, map.current]
}
