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
          paint: {
            'line-color': '#000',
            'line-dasharray': [1, 1],
            'line-width': 5
          },
          filter: ['==', 'mode', 'WALK']
        }, 'road-label')

        map.addLayer({
          id: `${id}-transit-shadow`,
          source: id,
          type: 'line',
          paint: {
            'line-color': '#000',
            'line-width': 1,
            'line-gap-width': 3
          },
          filter: [
            'all',
            ['!=', 'mode', 'WALK'],
            ['==', '$type', 'LineString']
          ]
        }, 'road-label')

        map.addLayer({
          id: `${id}-transit`,
          source: id,
          type: 'line',
          paint: {
            'line-color': ['get', 'routeColor'],
            'line-width': 3,
          },
          filter: [
            "all",
            ['!=', 'mode', 'WALK'],
            ['==', '$type', 'LineString']
          ]
        }, 'road-label')
      }
    })
  }, [map, allRoutes])
}

