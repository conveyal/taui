import React, {Component, PropTypes} from 'react'
import Dock from 'react-dock'
import {GeoJson, Map, Marker, Popup, TileLayer} from 'react-leaflet'
import {connect} from 'react-redux'
import Transitive from 'transitive-js'
import TransitiveLayer from 'leaflet-transitivelayer'

import {addActionLogItem, updateMapMarker, updateMap} from '../../actions'
import {fetchGrid, fetchQuery, fetchStopTrees, fetchTransitiveNetwork, updateOrigin} from '../../actions/browsochrones'
import CanvasTileLayer from '../../components/canvas-tile-layer'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import Log from '../../components/log'
import TimeCutoffSelect from '../../components/timecutoff-select'
import styles from './style.css'
import transitiveStyle from './transitive-style'

function printLatLng (latlng) {
  return `[ ${latlng.lng.toFixed(4)}, ${latlng.lat.toFixed(4)} ]`
}

class Indianapolis extends Component {
  static propTypes = {
    browsochrones: PropTypes.shape({
      showIsoLayer: PropTypes.bool,
      showIsoline: PropTypes.bool
    }),
    dispatch: PropTypes.any,
    mapMarkers: PropTypes.object,
    map: PropTypes.object,
    timeCutoff: PropTypes.shape({
      selected: PropTypes.number
    })
  }

  componentWillMount () {
    this.initializeBrowsochrones()
  }

  componentDidMount () {
    this.map = this.refs.map.getLeafletElement()
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

    if (!bc.transitiveNetwork) {
      dispatch(fetchTransitiveNetwork(browsochrones.transitiveNetworkUrl))
    }
  }

  /**
   * Callback to be executed on Origin Marker move. Update Browsochones when
   * Marker is dropped
   *
   * @private
   * @param  {Event} event
   */
  onMoveOrigin (latlng) {
    const {dispatch, browsochrones, mapMarkers} = this.props
    const originMarker = mapMarkers.origin

    dispatch(addActionLogItem(`Origin marker moved to ${printLatLng(latlng)}`))
    dispatch(updateMapMarker({
      originMarker: {
        latlng,
        text: ''
      }
    }))

    if (!originMarker.isDragging) {
      const origin = browsochrones.instance.pixelToOriginCoordinates(this.map.project(latlng), this.map.getZoom())

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
  onMoveDestination (latlng) {
    this.updateTransitive(latlng)
  }

  /**
   * When a destination marker is added, use its position to update Transitive
   *
   * @private
   * @param  {Event} e
   */
  onAddDestination (latlng) {
    this.updateTransitive(latlng)
  }

  updateTransitive (latlng) {
    const {browsochrones} = this.props
    const bc = browsochrones.instance

    // If an origin has been retrieved
    if (bc.isLoaded()) {
      const coordinates = bc.pixelToOriginCoordinates(this.map.project(latlng), this.map.getZoom())
      const data = bc.generateTransitiveData(coordinates)

      if (data.journeys.length > 0) {
        if (!this.transitive) {
          this.transitive = new Transitive({
            data,
            gridCellSize: 200,
            useDynamicRendering: true,
            styles: transitiveStyle
          })
          this.transitiveLayer = new TransitiveLayer(this.transitive)
          this.map.addLayer(this.transitiveLayer)
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

  generateIsoline (showIsoline, browsochrones, cutoff) {
    return showIsoline
      ? <GeoJson key={cutoff} data={browsochrones.getIsochrone(cutoff)} />
      : null
  }

  renderMap () {
    const {browsochrones, dispatch, map, mapMarkers, timeCutoff} = this.props

    return (
      <Map
        center={map.centerCoordinates}
        className={styles.map}
        onLeafletZoomEnd={event => dispatch(updateMap({ zoom: event.target._zoom }))}
        ref='map'
        zoom={map.zoom}
        >
        <TileLayer
          attribution={map.attribution}
          url={map.url}
        />
        <Marker
          draggable
          key='originMarker'
          position={mapMarkers.origin.latlng}
          onLeafletDragEnd={event => this.onMoveOrigin(event.target._latlng)}
          >
          <Popup><span>Origin {mapMarkers.origin.text || ''}</span></Popup>
        </Marker>

        {mapMarkers.destination &&
          <Marker
            draggable
            key='destinationMarker'
            position={mapMarkers.destination.latlng}
            onAdd={event => this.onAddDestination(event.target._latlng)}
            onLeafletDragEnd={event => this.onMoveDestination(event.target._latlng)}
            >
            <Popup><span>Destination {mapMarkers.destination.text || ''}</span></Popup>
          </Marker>
        }
        {this.generateIsoLayer(browsochrones.showIsoLayer, browsochrones.instance, timeCutoff.selected)}
        {this.generateIsoline(browsochrones.showIsoline, browsochrones.instance, timeCutoff.selected)}
      </Map>
    )
  }

  render () {
    const {browsochrones, dispatch, map} = this.props
    const {accessibility} = browsochrones

    return (
      <Fullscreen>
        {this.renderMap()}
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
                      origin: {
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
                      destination: {
                        latlng,
                        text: place.place_name
                      }
                    }))

                    this.log(`Selected: ${place.place_name}`)
                  }}
                  />
              </fieldset>
              <fieldset className='form-group'>
                <label>Time Cutoff</label>
                <TimeCutoffSelect className='form-control' />
              </fieldset>
              <fieldset className='form-group'>
                <label>Access</label>
                <p>{accessibility.toLocaleString()} indicators within 60 minutes.</p>
              </fieldset>
            </form>
          </div>
          <div className={styles.dockedActionLog}><Log /></div>
        </Dock>
      </Fullscreen>
    )
  }
}

export default connect(s => s)(Indianapolis)
