// @flow
import lonlat from '@conveyal/lonlat'

import {MAPBOX_GEOCODING_URL} from '../constants'
import fetch from '../utils/fetch'
import cacheURL from '../utils/cache-url'

/**
 * Format URL for fetching with query parameters
 */
function formatURL (text, accessToken, opts) {
  opts.access_token = accessToken
  const queryParams = Object.keys(opts).map(k => `${k}=${opts[k]}`).join('&')
  return cacheURL(`${MAPBOX_GEOCODING_URL}/${text}.json?${queryParams}`)
}

/**
 * Create an action that dispatches the given action on success.
 *
 * NB Content-Type is application/vnd.geo+json
 */
export const geocode = (text, nextAction) => (dispatch, getState) => {
  const state = getState()
  const {geocoder, map} = state

  dispatch(fetch(formatURL(text, map.accessToken, geocoder))
    .then(response => response.json())
    .then(geojson => nextAction(geojson.features)))
}

export const reverseGeocode = (position, nextAction) =>
  geocode(lonlat.toString(position), nextAction)
