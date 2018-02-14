// @flow
const TIMES_GRID_TYPE = 'ACCESSGR'

type TimesData = {
  version: number,
  zoom: number,
  west: number,
  north: number,
  width: number,
  height: number,
  nSamples: number,
  data: Int32Array
}

/**
 * Parse the ArrayBuffer from a `*_times.dat` file for a point in a network.
 */
export function parseTimesData (ab: ArrayBuffer): TimesData {
  const headerData = new Int8Array(ab.slice(0, TIMES_GRID_TYPE.length))
  const headerType = String.fromCharCode(...headerData)
  if (headerType !== TIMES_GRID_TYPE) {
    throw new Error(`Retrieved grid header ${headerType} !== ${TIMES_GRID_TYPE}. Please check your data.`)
  }

  const data = new Int32Array(ab.slice(TIMES_GRID_TYPE.length))
  let offset = 0
  const version = data[offset++]
  const zoom = data[offset++]
  const west = data[offset++]
  const north = data[offset++]
  const width = data[offset++]
  const height = data[offset++]
  const nSamples = data[offset++]

  return {
    version,
    zoom,
    west,
    north,
    width,
    height,
    nSamples,
    data: data.slice(TIMES_GRID_TYPE.length)
  }
}
