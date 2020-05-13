// @flow
import cacheURL from '../utils/cache-url'

export function loadPointsOfInterest(url) {
  return fetch(cacheURL(url)).then((response) => response.json())
}
