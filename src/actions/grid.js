// @flow
import fetch from '@conveyal/woonerf/fetch'

import type {Grid} from '../types'

function createGrid (data: ArrayBuffer): Grid {
  const array = new Int32Array(data, 4 * 5)
  const header = new Int32Array(data)

  let min = Infinity
  let max = -Infinity

  for (let i = 0, prev = 0; i < array.length; i++) {
    array[i] = (prev += array[i])
    if (prev < min) min = prev
    if (prev > max) max = prev
  }

  const width = header[3]
  const height = header[4]
  const contains = (x, y) => x >= 0 && x < width && y >= 0 && y < height

  // parse header
  return {
    zoom: header[0],
    west: header[1],
    north: header[2],
    width,
    height,
    data: array,
    min,
    max,
    contains,
    valueAtPoint (x, y) {
      if (contains(x, y)) {
        return array[y * width + x]
      } else {
        return 0
      }
    }
  }
}

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