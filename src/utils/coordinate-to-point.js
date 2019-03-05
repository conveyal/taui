import lonlat from '@conveyal/lonlat'

/**
 * Project a coordinate to it's pixel coordinate and find the appropriate point
 * associated with it.
 */
export default function coordinateToPoint(coordinate, zoom, west, north) {
  const pixel = lonlat.toPixel(coordinate, zoom)

  return {
    x: (pixel.x - west) | 0,
    y: (pixel.y - north) | 0
  }
}

/**
 * Convert a point to a coordinate
 */
export const pointToCoordinate = (x, y, zoom) => lonlat.fromPixel({x, y}, zoom)

/**
 * Get the index of a point based off the query width
 */
const pointToOriginIndex = (point, width) => point.x + point.y * width

/**
 * Convert a coordinate to an index
 */
export const coordinateToIndex = (c, q) =>
  pointToOriginIndex(coordinateToPoint(c, q.zoom, q.west, q.north), q.width)
