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
export const geocode = (text, accessToken, opts) =>
  fetch(formatURL(text, accessToken, opts))
    .then(response => response.json())
    .then(geojson => geojson.features)

export const reverseGeocode = (position, at, opts) =>
  geocode(lonlat.toString(position), at, opts)
