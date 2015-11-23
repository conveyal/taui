import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'

const localUrl = 'http://localhost:3000/test/data'
const baseUrl = 'http://localhost:4567'

const bc = new Browsochrones()

let isoLayer = null

Promise
  .all([
    fetch(`${localUrl}/query.json`).then(res => res.json()),
    fetch(`${localUrl}/stop_trees.dat`).then(res => res.arrayBuffer()),
    fetch(`${localUrl}/Jobs_total.grid`).then(res => res.arrayBuffer())
  ])
  .then(res => {
    bc.setQuery(res[0])
    bc.setStopTrees(res[1])
    bc.setGrid(res[2])

    return bc
  })

export function getOrigin (event) {
  const map = getMapFromEvent(event)

  // get the pixel coordinates
  const origin = bc.pixelToOriginCoordinates(map.project(event.latlng || event.target._latlng), map.getZoom())

  if (!bc.coordinatesInQueryBounds(origin)) {
    if (isoLayer) {
      map.removeLayer(isoLayer)
      isoLayer = null
    }
    return
  }

  return fetch(`${baseUrl}/${origin.x | 0}/${origin.y | 0}.dat`)
    .then(res => res.arrayBuffer())
    .then(origin => {
      bc.setOrigin(origin)
      bc.generateSurface()

      if (isoLayer) map.removeLayer(isoLayer)

      isoLayer = window.L.tileLayer.canvas()
      isoLayer.drawTile = bc.drawTile.bind(bc)
      isoLayer.addTo(map)

      return bc
    })
    .catch(err => {
      if (isoLayer) {
        map.removeLayer(isoLayer)
        isoLayer = null
      }

      console.error(err)
      console.error(err.stack)

      return err
    })
}

function getMapFromEvent (event) {
  let {_layers, _map} = event.target

  if (_map) return _map

  for (let key in _layers) {
    if (_layers.hasOwnProperty(key) && _layers[key]._map) {
      return _layers[key]._map
    }
  }
}
