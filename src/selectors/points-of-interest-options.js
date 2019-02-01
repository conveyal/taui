import {createSelector} from 'reselect'

export default createSelector(
  state => state.pointsOfInterest,
  featureCollection =>
    (featureCollection
      ? featureCollection.features.map(feature => {
        const p = feature.properties
        const label = p.label || p.name || p.Name
        return {
          label,
          value: `poi-${label}-${feature.geometry.coordinates.join(',')}`,
          coordinates: feature.geometry.coordinates
        }
      })
      : []
    )
)
