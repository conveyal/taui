// @flow
const HEADER_ENTRIES = 7
const HEADER_LENGTH = 9
const TIMES_GRID_TYPE = 'ACCESSGR'

type TimesData = {
  data: Int32Array,
  depth: number,
  height: number,
  north: number,
  version: number,
  west: number,
  width: number,
  zoom: number
}

/**
 * Parse the ArrayBuffer from a `*_times.dat` file for a point in a network.
 */
export function parseTimesData (ab: ArrayBuffer): TimesData {
  const headerType = String.fromCharCode(...new Int8Array(ab, 0, TIMES_GRID_TYPE.length))
  if (headerType !== TIMES_GRID_TYPE) {
    throw new Error(
      `Retrieved grid header ${headerType} !== ${TIMES_GRID_TYPE}. Please check your data.`
    )
  }

  const header = new Int32Array(
    ab,
    2 * Int32Array.BYTES_PER_ELEMENT,
    HEADER_ENTRIES
  )
  const version = header[0]
  const zoom = header[1]
  const west = header[2]
  const north = header[3]
  const width = header[4]
  const height = header[5]
  const depth = header[6]
  const gridSize = width * height

  const data = new Int32Array(
    ab,
    HEADER_LENGTH * Int32Array.BYTES_PER_ELEMENT,
    gridSize * depth
  )
  for (let i = 0, position = 0; i < depth; i++) {
    let previous = 0
    for (let j = 0; j < width * height; j++, position++) {
      data[position] = data[position] + previous
      previous = data[position]
    }
  }

  return {
    version,
    zoom,
    west,
    north,
    width,
    height,
    depth,
    data
  }
}
