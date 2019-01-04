// @flow
import fetch from 'isomorphic-fetch'

import cacheURL from '../utils/cache-url'
import createGrid from '../utils/create-grid'

export function loadGrid (
  grid: {
    icon: string,
    name: string,
    showOnMap: boolean,
    url: string
  }
) {
  return fetch(cacheURL(grid.url))
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => ({
      type: 'set grid',
      payload: {
        ...grid,
        ...createGrid(arrayBuffer)
      }
    }))
    .catch(err => {
      window.alert(`Error fetching ${grid.name} grid from ${grid.url}`)
      console.error(err)
    })
}
