// @flow
import lonlat from '@conveyal/lonlat'
import fetch from '@conveyal/woonerf/fetch'

import {MAPBOX_GEOCODING_URL} from '../constants'
import type {LonLat} from '../types'

import cacheURL from '../utils/cache-url'

/**
 * Format URL for fetching with query parameters
 */
function formatURL (text: string, opts) {
  opts.access_token = process.env.MAPBOX_ACCESS_TOKEN
  const queryParams = Object.keys(opts).map(k => `${k}=${opts[k]}`).join('&')
  return cacheURL(`${MAPBOX_GEOCODING_URL}/${text}.json?${queryParams}`)
}

/**
 * Create an action that dispatches the given action on success.
 *
 * NB Content-Type is application/vnd.geo+json so woonerf/fetch parses as text
 */
export function geocode (text: string, nextAction: any) {
  return function (dispatch: Dispatch, getState: any) {
    const state = getState()
    const {geocoder} = state

    dispatch(fetch({
      next: (response) => {
        try {
          if (typeof response.value === 'string') {
            return nextAction(JSON.parse(response.value).features)
          } else {
            return nextAction(response.value.features)
          }
        } catch (e) {
          console.error('Error parsing geocoder response.')
          console.error(e)
          throw e
        }
      },
      url: formatURL(text, geocoder)
    }))
  }
}

export const reverseGeocode = (position: LonLat, nextAction: any) =>
  geocode(lonlat.toString(position), nextAction)
