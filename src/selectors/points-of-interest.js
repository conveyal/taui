// @flow
import {createSelector} from 'reselect'

export default createSelector(
  state => state.data.pointsOfInterest,
  featureCollection =>
    (featureCollection
      ? featureCollection.features.map(feature => {
        const p = feature.properties
        const label = p.label || p.name || p.Name
        return {
          label,
          value: `poi-${label}-${feature.geometry.coordinates.join(',')}`,
          feature: {
            ...feature,
            properties: {
              ...p,
              label,
              'marker-color': '#0b2b40',
              'marker-size': 'small'
            }
          }
        }
      })
      : []
    )
)
