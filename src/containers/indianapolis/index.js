import Browsochrones from 'browsochrones'
import React, {Component, PropTypes} from 'react'
import Dock from 'react-dock'
import {GeoJson, Map, Marker, Popup, TileLayer} from 'react-leaflet'
import {connect} from 'react-redux'

import {addActionLogItem, updateMapMarker, updateMap} from '../../actions'
import {fetchGrid, fetchQuery, fetchStopTrees, fetchTransitiveNetwork, updateOrigin} from '../../actions/browsochrones'
import CanvasTileLayer from '../../components/canvas-tile-layer'
import DestinationsSelect from '../../components/destinations-select'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import ll from '../../ll'
import Log from '../../components/log'
import TimeCutoffSelect from '../../components/timecutoff-select'
import TransitiveLayer from '../../components/transitive-layer'
import styles from './style.css'
import transitiveStyle from './transitive-style'

class Indianapolis extends Component {
  static propTypes = {
    browsochrones: PropTypes.shape({
      showIsoLayer: PropTypes.bool,
      showIsoline: PropTypes.bool
    }),
    destinations: PropTypes.shape({
      selected: PropTypes.string
    }),
    dispatch: PropTypes.any,
    mapMarkers: PropTypes.shape({
      origin: PropTypes.object,
      destination: PropTypes.object
    }),
    map: PropTypes.object,
    timeCutoff: PropTypes.shape({
      selected: PropTypes.number
    })
  };

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
    this.browsochrones.grids = {}

    dispatch(fetchGrid(this.browsochrones, browsochrones.gridsUrl, 'Jobs_total'))
    dispatch(fetchGrid(this.browsochrones, browsochrones.gridsUrl, 'Workers_total'))
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
  moveOrigin (latlng, label) {
    const {dispatch, browsochrones} = this.props
    const origin = this.browsochrones.pixelToOriginCoordinates(this.map.project(latlng), this.map.getZoom())

    dispatch(addActionLogItem(`Origin marker moved to ${ll.print(latlng)}`))

    dispatch(updateMapMarker({
      origin: {
        latlng,
        label
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
  moveDestination (latlng, label) {
    this.props.dispatch(updateMapMarker({
      destination: {
        latlng,
        label
      }
    }))
  }

  /**
   * When a destination marker is added, use its position to update Transitive
   *
   * @private
   * @param  {Event} e
   */
  addDestination (latlng, label) {
    this.props.dispatch(updateMapMarker({
      destination: {
        latlng,
        label
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
          <Popup><span>Origin {mapMarkers.origin.label || ''}</span></Popup>
        </Marker>

        {mapMarkers.destination.latlng &&
          <Marker
            draggable
            key='destinationMarker'
            position={mapMarkers.destination.latlng}
            onAdd={event => this.addDestination(event.target._latlng)}
            onLeafletDragEnd={event => this.moveDestination(event.target._latlng)}
            >
            <Popup><span>Destination {mapMarkers.destination.label || ''}</span></Popup>
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
          mapMarkers.destination.latlng &&
          this.generateTransitiveLayer()}
      </Map>
    )
  }

  changeStartAddress (input) {
    if (!input) return
    const { label, value } = input
    const latlng = ll(value)
    this.log(`Selected: ${label}`)
    this.moveOrigin(latlng, label)
  }

  changeEndAddress (input) {
    const {dispatch} = this.props

    if (!input) {
      dispatch(updateMapMarker({
        destination: {
          latlng: null,
          label: null
        }
      }))
    } else {
      const { label, value } = input
      const latlng = ll(value)
      this.log(`Selected: ${label}`)
      dispatch(updateMapMarker({
        destination: {
          latlng,
          label
        }
      }))
    }
  }

  renderForm () {
    const {browsochrones, map, mapMarkers} = this.props
    const {accessibility} = browsochrones

    return (
      <form>
        <fieldset className='form-group'>
          <Geocoder
            apiKey={map.mapzen.apiKey}
            name='start-address'
            onChange={input => this.changeStartAddress(input)}
            placeholder='Search for a start address'
            defaultValue={markerToValue(mapMarkers.origin)}
            />
        </fieldset>
        <fieldset className='form-group'>
          <Geocoder
            apiKey={map.mapzen.apiKey}
            name='end-address'
            onChange={input => this.changeEndAddress(input)}
            placeholder='Search for an end address'
            defaultValue={markerToValue(mapMarkers.destination)}
            />
        </fieldset>
        <fieldset className='form-group'>
          <label>Time Cutoff</label>
          <TimeCutoffSelect className='form-control' />
        </fieldset>
        <fieldset className='form-group'>
          <label>Access to <strong>{accessibility.toLocaleString()}</strong></label>
          <DestinationsSelect className='form-control' />
        </fieldset>
      </form>
    )

    function markerToValue (m) {
      return m && m.label && m.latlng
        ? {label: m.label, value: ll.toString(m.latlng)}
        : null
    }
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
