import {createSelector} from 'reselect'

export default createSelector(
  state => state.geocoder.pointsOfInterest,
  (poi = []) =>
    poi.map(({coordinates, name}) => ({
      label: name,
      value: `poi-${name}-${coordinates.join(',')}`,
      feature: {
        type: 'Feature',
        properties: {
          label: name,
          'marker-color': '#0b2b40',
          'marker-size': 'small'
        },
        geometry: {
          type: 'Point',
          coordinates
        }
      }
    }))
)
