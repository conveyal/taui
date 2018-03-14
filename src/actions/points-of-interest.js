// @flow
import fetch from '@conveyal/woonerf/fetch'

export function loadPointsOfInterest (url: string) {
  return fetch({
    url,
    next: (response) => ({
      type: 'set points of interest',
      payload: typeof response.value === 'string'
        ? JSON.parse(response.value)
        : response.value
    })
  })
}
