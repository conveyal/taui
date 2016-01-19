import Browsochrones from 'browsochrones'
import React, {Component, PropTypes} from 'react'
import Dock from 'react-dock'
import {GeoJson, Map, Marker, Popup, TileLayer} from 'react-leaflet'
import {connect} from 'react-redux'

import {addActionLogItem, updateMapMarker, updateMap} from '../../actions'
import {fetchGrid, fetchQuery, fetchStopTrees, fetchTransitiveNetwork, updateOrigin} from '../../actions/browsochrones'
import CanvasTileLayer from '../../components/canvas-tile-layer'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import Log from '../../components/log'
import TimeCutoffSelect from '../../components/timecutoff-select'
import TransitiveLayer from '../../components/transitive-layer'
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
    // Save a reference to the map
    this.map = this.refs.map.getLeafletElement()
  }

  initializeBrowsochrones () {
    const {browsochrones, dispatch} = this.props
    this.browsochrones = new Browsochrones()
    const grid = 'Jobs_total'

    dispatch(fetchGrid(this.browsochrones, `${browsochrones.gridsUrl}/${grid}.grid`))
    dispatch(fetchQuery(this.browsochrones, browsochrones.queryUrl))
    dispatch(fetchStopTrees(this.browsochrones, browsochrones.stopTreesUrl))
    dispatch(fetchTransitiveNetwork(this.browsochrones, browsochrones.transitiveNetworkUrl))
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true
  }

  /**
   * Callback to be executed on Origin Marker move. Update Browsochones when
   * Marker is dropped
   *
   * @private
   * @param  {Event} event
   */
  moveOrigin (latlng) {
    const {dispatch, browsochrones} = this.props
    const origin = this.browsochrones.pixelToOriginCoordinates(this.map.project(latlng), this.map.getZoom())

    dispatch(addActionLogItem(`Origin marker moved to ${printLatLng(latlng)}`))

    dispatch(updateMapMarker({
      originMarker: {
        latlng,
        text: ''
      }
    }))

    dispatch(updateOrigin({
      browsochrones: this.browsochrones,
      origin,
      url: browsochrones.originsUrl
    }))
  }

  /**
   * Callback to be executed on Destination Marker move.
   *
   * @private
   * @param {Event} e
   */
  moveDestination (latlng) {
    this.props.dispatch(updateMapMarker({
      destination: {
        latlng
      }
    }))
  }

  /**
   * When a destination marker is added, use its position to update Transitive
   *
   * @private
   * @param  {Event} e
   */
  addDestination (latlng) {
    this.props.dispatch(updateMapMarker({
      destination: {
        latlng
      }
    }))
  }

  generateTransitiveLayer () {
    const {latlng} = this.props.mapMarkers.destination
    const coordinates = this.browsochrones.pixelToOriginCoordinates(this.map.project(latlng), this.map.getZoom())
    const data = this.browsochrones.generateTransitiveData(coordinates)

    return <TransitiveLayer
      key={`transitive-${this.latlngKey()}`}
      data={data}
      styles={transitiveStyle}
      />
  }

  latlngKey () {
    const {mapMarkers} = this.props
    const {destination, origin} = mapMarkers
    if (destination) return `${JSON.stringify(origin.latlng)}-${JSON.stringify(destination.latlng)}`
    return JSON.stringify(origin.latlng)
  }

  renderMap () {
    const {dispatch, map, mapMarkers, timeCutoff} = this.props

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
          onLeafletDragEnd={event => this.moveOrigin(event.target._latlng)}
          >
          <Popup><span>Origin {mapMarkers.origin.text || ''}</span></Popup>
        </Marker>

        {mapMarkers.destination &&
          <Marker
            draggable
            key='destinationMarker'
            position={mapMarkers.destination.latlng}
            onAdd={event => this.addDestination(event.target._latlng)}
            onLeafletDragEnd={event => this.moveDestination(event.target._latlng)}
            >
            <Popup><span>Destination {mapMarkers.destination.text || ''}</span></Popup>
          </Marker>
        }
        {this.browsochrones.isLoaded() &&
          <CanvasTileLayer
            key={`isochrone-${this.latlngKey()}`}
            drawTile={this.browsochrones.drawTile.bind(this.browsochrones)}
            />
        }
        {this.browsochrones.isLoaded() &&
          <GeoJson
            key={`isoline-${this.latlngKey()}-${timeCutoff.selected}`}
            data={this.browsochrones.getIsochrone(timeCutoff.selected)}
            />
        }
        {this.browsochrones.isLoaded() &&
          mapMarkers.destination &&
          this.generateTransitiveLayer()}
      </Map>
    )
  }

  renderForm () {
    const {browsochrones, dispatch, map} = this.props
    const {accessibility} = browsochrones

    return (
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
              this.moveOrigin(latlng)
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
    )
  }

  render () {
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
          <div className={styles.dockContent}>{this.renderForm()}</div>
          <div className={styles.dockedActionLog}><Log /></div>
        </Dock>
      </Fullscreen>
    )
  }

  log (l) {
    const {dispatch} = this.props
    dispatch(addActionLogItem(l))
  }
}

export default connect(s => s)(Indianapolis)
