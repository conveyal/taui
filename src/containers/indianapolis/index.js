import debounce from 'debounce'
import React, {Component, PropTypes} from 'react'
import Dock from 'react-dock'
import {connect} from 'react-redux'
import Transitive from 'transitive-js'
import TransitiveLayer from 'leaflet-transitivelayer'

import {addActionLogItem, updateMapMarker, updateMap} from '../../actions'
import {fetchGrid, fetchOrigin, fetchQuery, fetchStopTrees, fetchTransitiveNetwork, updateOrigin} from '../../actions/browsochrones'
import CanvasTileLayer from '../../components/canvas-tile-layer'
import Fullscreen from '../../components/fullscreen'
import renderMarkers, {mapMarkerConstants} from '../../components/marker-helper'
import Geocoder from '../../components/geocoder'
import Log from '../../components/log'
import Map from '../../components/map'
import styles from './style.css'
import transitiveStyle from './transitive-style'

function printLatLng (latlng) {
  return `[ ${latlng.lng.toFixed(4)}, ${latlng.lat.toFixed(4)} ]`
}

/**
 * Callback to be executed on Origin Marker move. Update Browsochones when
 * Marker is dropped
 *
 * @private
 * @param  {Event} event
 */
function onMoveOrigin (event) {
  const {dispatch, browsochrones, mapMarkers} = this.props
  const latlng = event.target._latlng
  const map = getMapFromEvent(event)
  const originMarker = mapMarkers[mapMarkerConstants.ORIGIN]

  dispatch(addActionLogItem(`Dragged origin marker to ${printLatLng(latlng)}`))
  dispatch(updateMapMarker({
    originMarker: {
      latlng,
      text: ''
    }
  }))

  if (!originMarker.isDragging) {
    const origin = browsochrones.instance.pixelToOriginCoordinates(map.project(latlng), map.getZoom())

    this.log(`Origin marker dragged to ${printLatLng(latlng)}`)

    dispatch(updateOrigin({
      browsochrones: browsochrones.instance,
      origin,
      url: browsochrones.originsUrl
    }))
  }
}

/**
 * Callback to be executed on Destination Marker move.
 *
 * @private
 * @param {Event} e
 */
function onMoveDestination (e) {
  this.updateTransitive(e)
}

/**
 * When a destination marker is added, use its position to update Transitive
 *
 * @private
 * @param  {Event} e
 */
function onAddDestination (e) {
  const site = this
  const destinationEvent = Object.assign(e, {
    latlng: site.props.mapMarkers[mapMarkerConstants.DESTINATION].latlng
  })
  site.updateTransitive(destinationEvent)
}

class Indianapolis extends Component {
  static propTypes = {
    browsochrones: PropTypes.shape({
      showIsoLayer: PropTypes.bool
    }),
    dispatch: PropTypes.any,
    mapMarkers: PropTypes.object,
    map: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.updateTransitive = debounce(this.updateTransitive, 200, true)
  }

  componentWillMount () {
    this.initializeBrowsochrones()
  }

  log (l) {
    const {dispatch} = this.props
    dispatch(addActionLogItem(l))
  }

  initializeBrowsochrones () {
    const {browsochrones, dispatch} = this.props
    const bc = browsochrones.instance
    const grid = 'Jobs_total'

    if (!bc.grid) {
      dispatch(fetchGrid(`${browsochrones.gridsUrl}/${grid}.grid`))
    }

    if (!bc.query) {
      dispatch(fetchQuery(browsochrones.queryUrl))
    }

    if (!bc.stopTrees) {
      dispatch(fetchStopTrees(browsochrones.stopTreesUrl))
    }

    if (!bc.originData && bc.originCoordinates) {
      dispatch(fetchOrigin(browsochrones.originsUrl, bc.originCoordinates))
    }

    if (!bc.transitiveNetwork) {
      dispatch(fetchTransitiveNetwork(browsochrones.transitiveNetworkUrl))
    }
  }

  updateTransitive (event) {
    const {browsochrones} = this.props
    const bc = browsochrones.instance

    // If an origin has been retrieved
    if (bc.isLoaded()) {
      const map = getMapFromEvent(event)
      const origin = bc.pixelToOriginCoordinates(map.project(event.latlng), map.getZoom())

      const data = bc.generateTransitiveData(origin)

      if (data.journeys.length > 0) {
        if (!this.transitive) {
          this.transitive = new Transitive({
            data,
            gridCellSize: 200,
            useDynamicRendering: true,
            styles: transitiveStyle
          })
          this.transitiveLayer = new TransitiveLayer(this.transitive)
          map.addLayer(this.transitiveLayer)
          this.transitiveLayer._refresh()
        } else {
          this.transitive.updateData(data)
          this.transitiveLayer._refresh()
        }
      }

      this.log(`Transitive found ${data.journeys.length} unique paths`)
    }
  }

  generateIsoLayer (showIsoLayer, browsochrones) {
    return showIsoLayer
      ? <CanvasTileLayer drawTile={browsochrones.drawTile.bind(browsochrones)} />
      : null
  }

  render () {
    const {browsochrones, dispatch, map, mapMarkers} = this.props
    const {accessibility} = browsochrones
    const originMarker = renderMarkers(mapMarkers, mapMarkerConstants.ORIGIN, dispatch, onMoveOrigin.bind(this), () => {})
    const destinationMarker = renderMarkers(mapMarkers, mapMarkerConstants.DESTINATION, dispatch, onMoveDestination.bind(this), onAddDestination.bind(this))
    const isoLayer = this.generateIsoLayer(browsochrones.showIsoLayer, browsochrones.instance)

    return (
      <Fullscreen>
        <Map
          className={styles.map}
          map={map}
          onChange={state => dispatch(updateMap(state))}
          onClick={e => {
            const {latlng} = e
            this.log(`Clicked map at ${printLatLng(latlng)}`)

            dispatch(updateMapMarker({
              latlng,
              text: ''
            }))
          }}>
          {[originMarker, destinationMarker]}
          {isoLayer}
        </Map>
        <Dock
          dimMode='none'
          fluid
          isVisible
          position='right'
          >
          <div className={styles.navbar}>Champagne</div>
          <div className={styles.dockContent}>
            <form>
              <fieldset className='form-group'>
                <Geocoder
                  accessToken={map.mapbox.accessToken}
                  inputPlaceholder='Search for a start address'
                  onSelect={place => {
                    const [lng, lat] = place.center
                    const latlng = {lat, lng}

                    dispatch(updateMapMarker({
                      [mapMarkerConstants.ORIGIN]: {
                        latlng,
                        text: place.place_name
                      }
                    }))

                    this.log(`Selected: ${place.place_name}`)
                  }}
                  />
              </fieldset>
              <fieldset className='form-group'>
                <Geocoder
                  accessToken={map.mapbox.accessToken}
                  inputPlaceholder='Search for an end address'
                  onSelect={place => {
                    const [lng, lat] = place.center
                    const latlng = {lat, lng}

                    dispatch(updateMapMarker({
                      [mapMarkerConstants.DESTINATION]: {
                        latlng,
                        text: place.place_name
                      }
                    }))

                    this.log(`Selected: ${place.place_name}`)
                  }}
                  />
              </fieldset>
            </form>
            <h5>Access</h5>
            <p>{accessibility.toLocaleString()} indicators within 60 minutes.</p>
          </div>
          <div className={styles.dockedActionLog}><Log /></div>
        </Dock>
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
