// @flow
import lonlat from '@conveyal/lonlat'
import Leaflet from 'leaflet'

import type {LonLat, Point, Query} from '../types'

/**
 * Project a coordinate to it's pixel coordinate and find the appropriate point
 * associated with it.
 */
export default function coordinateToPoint (coordinate: LonLat, currentZoom: number, query: Query): Point {
  const pixel = Leaflet.CRS.EPSG3857.latLngToPoint(
    lonlat.toLeaflet(coordinate),
    currentZoom
  )
  const scale = Math.pow(2, query.zoom - currentZoom)

  let {x, y} = pixel
  x = x * scale - query.west | 0
  y = y * scale - query.north | 0

  return {x, y}
}

export const pointToOriginIndex = (point: Point, width: number) =>
  point.x + point.y * width
