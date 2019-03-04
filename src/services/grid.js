import cacheURL from '../utils/cache-url'
import createGrid from '../utils/create-grid'
import fetch from '../utils/fetch'

export function loadGrid(grid) {
  return fetch(cacheURL(grid.url))
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => ({
      ...grid,
      ...createGrid(arrayBuffer)
    }))
    .catch(err => {
      if (typeof window !== 'undefined') {
        window.alert(`Error fetching ${grid.name} grid from ${grid.url}`)
      }

      console.error(err)
    })
}
