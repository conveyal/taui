// @flow
import fetch from '@conveyal/woonerf/fetch'

import createGrid from '../utils/create-grid'

export function loadGrid (gridName: string, url: string) {
  return fetch({
    url: `${url}/${gridName}.grid`,
    next (response) {
      return {
        type: 'set grid',
        payload: {
          name: gridName,
          ...createGrid(response.value)
        }
      }
    }
  })
}
