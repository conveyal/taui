import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'
import React, {Component, PropTypes} from 'react'
import {Map, TileLayer} from 'react-leaflet'

const ATTRIBUTION = `&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`

const bc = new Browsochrones()

const localUrl = 'http://localhost:3000/test/data'
const baseUrl = 'http://localhost:4567'

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
  })
  .catch(e => {
    console.error(e)
    console.error(e.stack)
  })

export default class BrowsochronesMap extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    map: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
  }

  onClick (event) {
    const map = getMapFromEvent(event)

    // get the pixel coordinates
    const origin = bc.pixelToOriginCoordinates(map.project(event.latlng), map.getZoom())
    // document.getElementById('location').value = `${origin.x | 0} / ${origin.y | 0}`

    if (!bc.coordinatesInQueryBounds(origin)) {
      if (this.isoLayer) {
        map.removeLayer(this.isoLayer)
        this.isoLayer = null
      }
      return
    }

    console.time('fetching origin')
    fetch(`${baseUrl}/${origin.x | 0}/${origin.y | 0}.dat`)
      .then(res => res.arrayBuffer())
      .then(origin => {
        console.timeEnd('fetching origin')
        bc.setOrigin(origin)

        console.time('generating surface')
        bc.generateSurface()
        console.timeEnd('generating surface')

        // Set the access output
        // document.getElementById('access').value = bc.getAccessibilityForCutoff()

        if (this.isoLayer) map.removeLayer(this.isoLayer)

        this.isoLayer = window.L.tileLayer.canvas()
        this.isoLayer.drawTile = bc.drawTile.bind(bc)
        this.isoLayer.addTo(map)

        // this.drawTile = bc.drawTile.bind(bc)
      })
      .catch(err => {
        if (this.isoLayer) {
          map.removeLayer(this.isoLayer)
          this.isoLayer = null
        }

        console.error(err)
        console.error(err.stack)
      })
  }

  render () {
    const {children, className, map} = this.props
    const url = `http://api.tiles.mapbox.com/v4/${map.mapbox.mapId}/{z}/{x}/{y}.png?access_token=${map.mapbox.accessToken}`

    return (
      <Map
        center={map.center}
        className={className}
        zoom={map.zoom}
        onLeafletClick={this.onClick}
        >
        <TileLayer
          url={url}
          attribution={ATTRIBUTION}
        />
        {children}
      </Map>
    )
  }
}

function getMapFromEvent (event) {
  const {_layers} = event.target
  for (let key in _layers) {
    if (_layers.hasOwnProperty(key) && _layers[key]._map) {
      return _layers[key]._map
    }
  }
}
