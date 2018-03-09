// @flow
import lonlat from '@conveyal/lonlat'
import Leaflet from 'leaflet'

import type {LonLat, Point, Query} from '../types'

/**
 * Project a coordinate to it's pixel coordinate and find the appropriate point
 * associated with it.
 */
export default function coordinateToPoint (
  coordinate: LonLat,
  currentZoom: number,
  queryZoom: number,
  west: number,
  north: number
): Point {
  const pixel = Leaflet.CRS.EPSG3857.latLngToPoint(
    lonlat.toLeaflet(coordinate),
    currentZoom
  )
  const scale = Math.pow(2, queryZoom - currentZoom)

  let {x, y} = pixel
  x = (x * scale - west) | 0
  y = (y * scale - north) | 0

  return {x, y}
}

/**
 * Get the index of a point based off the query width
 */
const pointToOriginIndex = (point: Point, width: number) =>
  point.x + point.y * width

/**
 * Convert a coordinate to an index
 */
export const coordinateToIndex = (c: LonLat, z: number, q: Query): number =>
  pointToOriginIndex(coordinateToPoint(c, z, q.zoom, q.west, q.north), q.width)
