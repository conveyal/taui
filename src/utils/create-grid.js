// @flow
import type {Grid} from '../types'

/**
 * Create a grid from an ArrayBuffer
 */
export default function createGrid (data: ArrayBuffer): Grid {
  const array = new Int32Array(data, 4 * 5)
  const header = new Int32Array(data)

  let min = Infinity
  let max = -Infinity

  // de-delta code
  for (let i = 0, prev = 0; i < array.length; i++) {
    array[i] = prev += array[i]
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
