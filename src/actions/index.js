// @flow
export const setSelectedTimeCutoff = (payload: number) =>
  ({type: 'set selected time cutoff', payload})

/**
 * Update the map and store the settings as query parameters in the URL
 */
export const updateMap = (payload: any) => {
  // Object.keys(payload).forEach(key => setKeyTo(key, payload[key])) fix for zoom & centerCoordinates

  return {
    type: 'update map',
    payload
  }
}
