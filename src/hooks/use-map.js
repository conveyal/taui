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
    const newMap = window.map = new mapboxgl.Map({
      center,
      container: ref.current,
      style,
      zoom
    })

    newMap.on('load', () => {
      newMap.addControl(navControl, 'top-right')
      map.current = newMap
    })

    newMap.on('click', e => events.onClick(lonlat(e.lngLat)))
    newMap.on('moveend', () => events.onMove(lonlat(newMap.getCenter())))
    newMap.on('zoomend', () => events.onZoom(newMap.getZoom()))

    return () => {
      if (map.current) map.current.remove()
      map.current = null
    }
  }, [ref])

  return [ref, map.current]
}
