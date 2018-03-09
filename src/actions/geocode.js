// @flow
import lonlat from '@conveyal/lonlat'
import fetch from '@conveyal/woonerf/fetch'

import {MAPBOX_GEOCODING_URL} from '../constants'

import type {LonLat} from '../types'

/**
 * Format URL for fetching with query parameters
 */
function formatURL (text: string, opts) {
  opts.access_token = process.env.MAPBOX_ACCESS_TOKEN
  const queryParams = Object.keys(opts).map(k => `${k}=${opts[k]}`).join('&')
  return `${MAPBOX_GEOCODING_URL}/${text}.json?${queryParams}`
}

/**
 * Create an action that dispatches the given action on success.
 */
export function geocode (text: string, nextAction: any) {
  return function (dispatch: Dispatch, getState: any) {
    const state = getState()
    const {geocoder} = state

    dispatch(fetch({
      url: formatURL(text, geocoder),
      next: (response) => nextAction(JSON.parse(response.value).features) // Content-Type is application/vnd.geo+json so woonerf/fetch parses as text
    }))
  }
}

export const reverseGeocode = (position: LonLat, nextAction: any) =>
  geocode(lonlat.toString(position), nextAction)
