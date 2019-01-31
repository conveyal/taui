import useIfExists from './use-if-exists'

export default function useGeoJSONRoutes (map, allRoutes) {
  useIfExists(() => {
    allRoutes.forEach((routes, nIndex) => {
      // Just use the first one for now
      const featureCollection = routes[0]
      if (!featureCollection) return

      const id = `route-for-${nIndex}`
      let source = map.getSource(id)

      if (source) {
        source.setData(featureCollection)
      } else {
        map.addSource(id, {
          type: 'geojson',
          data: featureCollection
        })

        map.addLayer({
          id: `${id}-walk`,
          source: id,
          type: 'line',
          layout: {
            'line-cap': 'butt'
          },
          paint: {
            'line-color': '#333',
            'line-dasharray': [1, 1],
            'line-width': 5
          },
          filter: ['==', 'mode', 'WALK']
        }, 'road-label')

        map.addLayer({
          id: `${id}-transit`,
          source: id,
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': ['get', 'routeColor'],
            'line-width': 5,
          },
          filter: [
            "all",
            ['!=', 'mode', 'WALK'],
            ['==', '$type', 'LineString']
          ]
        }, 'road-label')

        map.addLayer({
          id: `${id}-stops`,
          source: id,
          type: 'circle',
          paint: {
            'circle-radius': 3,
            'circle-color': '#fff',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#333'
          },
          filter: ['==', '$type', 'Point']
        }, 'road-label')
      }
    })
  }, [map, allRoutes])
}

