// @flow
import fetch from '@conveyal/woonerf/fetch'

import createGrid from '../utils/create-grid'

export function loadGrid (
  grid: {
    icon: string,
    name: string,
    url: string
  }
) {
  return fetch({
    url: grid.url,
    next (response) {
      return {
        type: 'set grid',
        payload: {
          icon: grid.icon,
          name: grid.name,
          ...createGrid(response.value)
        }
      }
    }
  })
}
