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
      if (response.headers.get('Content-Type') !== 'application/octet-stream') {
        return window.alert('Invalid opportunity dataset "Content-Type". Must be "application/octet-stream".')
      }

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
