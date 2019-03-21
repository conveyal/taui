import memoize from 'memoize-one'
import once from 'lodash/once'

const EmptyCollection = {type: 'FeatureCollection', features: []}
const getId = i => `route-for-${i}`

const initializeOnce = once(initializeGeoJSONRoutes)

export default memoize(function renderGeoJSONRoutes(map, allRoutes) {
  initializeOnce(map, allRoutes)
  allRoutes.forEach((routes, i) => {
    const source = map.getSource(getId(i))
    if (source) source.setData(routes[0] || EmptyCollection)
  })
})

function initializeGeoJSONRoutes(map, allRoutes) {
  allRoutes.forEach((routes, nIndex) => {
    // Just use the first one for now
    const featureCollection = routes[0] || EmptyCollection
    const id = getId(nIndex)

    map.addSource(id, {
      type: 'geojson',
      data: featureCollection
    })

    map.addLayer(
      {
        id: `${id}-walk`,
        source: id,
        type: 'line',
        paint: {
          'line-color': '#000',
          'line-dasharray': [1, 1],
          'line-width': 5
        },
        filter: ['==', 'mode', 'WALK']
      },
      'road-label'
    )

    map.addLayer(
      {
        id: `${id}-transit-shadow`,
        source: id,
        type: 'line',
        paint: {
          'line-color': '#000',
          'line-width': 1,
          'line-gap-width': 3
        },
        filter: ['all', ['!=', 'mode', 'WALK'], ['==', '$type', 'LineString']]
      },
      'road-label'
    )

    map.addLayer(
      {
        id: `${id}-transit`,
        source: id,
        type: 'line',
        paint: {
          'line-color': ['get', 'routeColor'],
          'line-width': 3
        },
        filter: ['all', ['!=', 'mode', 'WALK'], ['==', '$type', 'LineString']]
      },
      'road-label'
    )
  })
}
