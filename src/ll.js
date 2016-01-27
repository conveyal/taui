
module.exports = normalize

module.exports.toString = function toString (input) {
  var ll = normalize(input)
  return ll.lng + ',' + ll.lat
}

module.exports.print = function print (input, fixed) {
  var ll = normalize(input)
  return '[' + ll.lng.toFixed(fixed || 4) + ',' + ll.lat.toFixed(fixed || 4) + ']'
}

module.exports.toCoordinate = function toCoordinate (input) {
  var ll = normalize(input)
  return [ll.lng, ll.lat]
}

module.exports.toPoint = function toPoint (input) {
  var ll = normalize(input)
  return {x: ll.lat, y: ll.lng}
}

function normalize (unknown) {
  if (!unknown) throw new Error('Point must be defined.')
  var lat = unknown.lat
  var lng = unknown.lng || unknown.lon
  if (Array.isArray(unknown)) {
    lng = unknown[0]
    lat = unknown[1]
  } else if (typeof unknown === 'string') {
    const arr = unknown.split(',')
    lng = arr[0]
    lat = arr[1]
  } else if (unknown.x && unknown.y) {
    lng = unknown.x
    lat = unknown.y
  }
  return {lng: parseFloat(lng), lat: parseFloat(lat)}
}
