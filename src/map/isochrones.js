import once from 'lodash/once'
import memoize from 'memoize-one'

/**
 * Isochrones are in reverse order of the networks.
 */
export default memoize(function renderIsochrones(map, isochrones) {
  initializeOnce(map, isochrones)
  console.log('renderiso', map, isochrones)

  // Set the data for each isochrone if it hasn't been done
  isochrones.forEach((isochrone, i) => {
    const source = map.getSource(isochrone.properties.id)
    if (source) source.setData(isochrone)
  })
})

const initializeOnce = once(function initializeIsochrones(map, isochrones) {
  isochrones.forEach((isochrone, i) => {
    const id = isochrone.properties.id
    map.addSource(id, {type: 'geojson', data: isochrone})

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
})
