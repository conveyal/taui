// @flow
import {createSelector} from 'reselect'

export default createSelector(
  state => state.data.pointsOfInterest,
  (featureCollection) =>
    featureCollection
      ? featureCollection.features.map(feature => ({
        label: feature.properties.name,
        value: `poi-${feature.properties.name}-${feature.geometry.coordinates.join(',')}`,
        feature: {
          ...feature,
          properties: {
            ...feature.properties,
            label: feature.properties.name,
            'marker-color': '#0b2b40',
            'marker-size': 'small'
          }
        }
      }))
    : []
)
