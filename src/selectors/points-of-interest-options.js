import lonlat from '@conveyal/lonlat'
import { createSelector } from 'reselect'

export default createSelector(
  state => state.pointsOfInterest,
  featureCollection =>
    featureCollection
      ? featureCollection.features.map(feature => {
        const p = feature.properties
        const label = p.label || p.name || p.Name
        const coordinates = feature.geometry.coordinates
        return {
          label,
          position: lonlat(coordinates),
          value: `poi-${label}-${feature.geometry.coordinates.join(',')}`,
          coordinates
        }
      })
      : []
)
