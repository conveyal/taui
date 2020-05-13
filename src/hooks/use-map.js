import lonlat from '@conveyal/lonlat'
import mapboxgl from 'mapbox-gl'
import React from 'react'

import {POI_ID} from '../constants'

// Default NavigationControl
const navControl = new mapboxgl.NavigationControl({showCompass: false})

export default function useMap(mapProps, events, setMap) {
  const ref = React.useRef(null)

  // Runs on mount
  React.useEffect(() => {
    let accessToken = mapProps.accessToken || process.env.MAPBOX_ACCESS_TOKEN
    if (!accessToken) {
      const accessToken = window.prompt('Enter a Mapbox access token')
      mapProps.updateMap({accessToken})
    }
    mapboxgl.accessToken = accessToken

    // Create map
    const m = (window.map = new mapboxgl.Map({
      center: mapProps.center,
      container: ref.current,
      maxBounds: mapProps.maxBounds,
      minZoom: mapProps.minZoom,
      style: mapProps.style,
      zoom: mapProps.zoom
    }))

    m.on('load', () => {
      setMap(m)
      m.addControl(navControl, 'top-right')
    })
    m.on('click', (e) => {
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
      ]
      const pois = m.queryRenderedFeatures(bbox, {layers: [POI_ID]})
      if (pois.length > 0) {
        const poi = pois[0]
        events.onClick({
          label: poi.properties.label,
          position: lonlat(poi.geometry.coordinates)
        })
      } else {
        events.onClick({position: lonlat(e.lngLat)})
      }
    })
    m.on('moveend', () => events.onMove(lonlat(m.getCenter())))
    m.on('zoomend', () => events.onZoom(m.getZoom()))

    return () => {
      if (m) m.remove()
    }
  }, [ref]) // eslint-disable-line

  return ref
}
