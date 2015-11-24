import React, {Component, PropTypes} from 'react'
import {Marker, Popup} from 'react-leaflet'
import {connect} from 'react-redux'

import {updateMapMarker, updateMap} from '../../actions'
import {fetchGrid, fetchOrigin, fetchQuery, fetchStopTrees, setAccessibility, setSurface} from '../../actions/browsochrones'
import {mapbox} from '../../config'
import DestinationsSelect from '../../components/destinations-select'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import log from '../../log'
import Log from '../../components/log'
import Map from '../../components/map'
import styles from './style.css'

const baseUrl = 'http://localhost:4567'
const localUrl = 'http://localhost:3000/test/data'

function printLL (ll) {
  return `[ ${ll[0].toFixed(4)}, ${ll[1].toFixed(4)} ]`
}

class Indianapolis extends Component {
  static propTypes = {
    browsochrones: PropTypes.object,
    dispatch: PropTypes.any,
    mapMarker: PropTypes.object,
    map: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.initializeBrowsochrones()
  }

  initializeBrowsochrones () {
    const {browsochrones, dispatch} = this.props
    const bc = browsochrones.instance

    if (!bc.grid) {
      fetchGrid(`${localUrl}/Jobs_total.grid`)(dispatch)
    }

    if (!bc.query) {
      fetchQuery(`${localUrl}/query.json`)(dispatch)
    }

    if (!bc.stopTrees) {
      fetchStopTrees(`${localUrl}/stop_trees.dat`)(dispatch)
    }

    if (!bc.originData && bc.originCoordinates) {
      fetchOrigin(baseUrl, bc.originCoordinates)(dispatch)
    }
  }

  updateBrowsochrones (event) {
    log(`Retrieving isochrones for origin.`)

    const {browsochrones, dispatch} = this.props
    const bc = browsochrones.instance
    const map = getMapFromEvent(event)

    // get the pixel coordinates
    const origin = bc.pixelToOriginCoordinates(map.project(event.latlng || event.target._latlng), map.getZoom())

    if (!bc.coordinatesInQueryBounds(origin)) {
      if (this.isoLayer) {
        map.removeLayer(this.isoLayer)
        this.isoLayer = null
      }
      return
    }

    fetchOrigin(baseUrl, origin)(dispatch)
      .then(r => {
        dispatch(setSurface(bc.generateSurface()))
        dispatch(setAccessibility(bc.getAccessibilityForCutoff()))

        if (this.isoLayer) map.removeLayer(this.isoLayer)

        this.isoLayer = window.L.tileLayer.canvas()
        this.isoLayer.drawTile = bc.drawTile.bind(bc)
        this.isoLayer.addTo(map)
      })
      .catch(err => {
        if (this.isoLayer) {
          map.removeLayer(this.isoLayer)
          this.isoLayer = null
        }

        console.error(err)
        console.error(err.stack)
        throw err
      })
  }

  render () {
    const {dispatch, map, mapMarker} = this.props

    return (
      <Fullscreen>
        <div className={styles.main}>
          <Map
            className={styles.map}
            map={map}
            onChange={state => dispatch(updateMap(state))}
            onClick={e => {
              const {lat, lng} = e.latlng
              log(`Clicked map at ${printLL([lat, lng])}`)

              dispatch(updateMapMarker({
                position: [lat, lng],
                text: ''
              }))
            }}>
            {(() => {
              if (mapMarker && mapMarker.position) {
                return (
                  <Marker
                    draggable={true}
                    position={mapMarker.position}
                    onLeafletDragStart={e => {
                      const {lat, lng} = e.target._latlng
                      const position = [lat, lng]

                      dispatch(updateMapMarker({
                        isDragging: true,
                        position,
                        text: ''
                      }))
                    }}
                    onLeafletDragEnd={e => {
                      const {lat, lng} = e.target._latlng
                      const position = [lat, lng]
                      log(`Dragged marker to ${printLL(position)}`)

                      dispatch(updateMapMarker({
                        isDragging: false,
                        position,
                        text: ''
                      }))
                    }}
                    onMove={e => {
                      if (!mapMarker.isDragging) {
                        this.updateBrowsochrones(e)
                      }
                    }}>
                    {mapMarker.text && <Popup><span>{mapMarker.text}</span></Popup>}
                  </Marker>
                )
              }
            })()}
          </Map>
          <div className={styles.sideBar}>
            <div className={styles.scrollable}>
              <form>
                <fieldset className='form-group' style={{position: 'relative'}}>
                  <Geocoder
                    accessToken={mapbox.accessToken}
                    onSelect={place => {
                      const [lng, lat] = place.center
                      const position = [lat, lng]

                      dispatch(updateMapMarker({
                        position,
                        text: place.place_name
                      }))

                      log(`Selected: ${place.place_name}`)
                    }}
                    />
                </fieldset>
                <fieldset className='form-group'>
                  <label>Select a key indicator</label>
                  <DestinationsSelect className='form-control' />
                </fieldset>
              </form>
            </div>

            <div className={styles.navbar}>Indianapolis</div>
            <div className={styles.dockedActionLog}><Log /></div>
          </div>
        </div>
      </Fullscreen>
    )
  }
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

export default connect(s => s)(Indianapolis)
