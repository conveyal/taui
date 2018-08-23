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
  queryZoom: number,
  west: number,
  north: number
): Point {
  const pixel = Leaflet.CRS.EPSG3857.latLngToPoint(
    lonlat.toLeaflet(coordinate),
    queryZoom
  )

  return {
    x: (pixel.x - west) | 0,
    y: (pixel.y - north) | 0
  }
}

/**
 * Convert a point to a coordinate
 */
export const pointToCoordinate = (x: number, y: number, zoom: number) =>
  Leaflet.CRS.EPSG3857.pointToLatLng({x, y}, zoom)

/**
 * Get the index of a point based off the query width
 */
const pointToOriginIndex = (point: Point, width: number) =>
  point.x + point.y * width

/**
 * Convert a coordinate to an index
 */
export const coordinateToIndex = (c: LonLat, q: Query): number =>
  pointToOriginIndex(coordinateToPoint(c, q.zoom, q.west, q.north), q.width)
