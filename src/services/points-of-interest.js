// @flow
import cacheURL from '../utils/cache-url'
import fetch from '../utils/fetch'

export function loadPointsOfInterest (url) {
  return fetch(cacheURL(url))
    .then(response => response.json())
}
