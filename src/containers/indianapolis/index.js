import Browsochrones from 'browsochrones'
import Color from 'color'
import lonlng from 'lonlng'
import React, {Component, PropTypes} from 'react'
import Dock from 'react-dock'
import {GeoJson, Map, Marker, Popup, TileLayer} from 'react-leaflet'
import {connect} from 'react-redux'

import {addActionLogItem, updateMapMarker, updateMap, updateSelectedDestination} from '../../actions'
import {fetchGrid, fetchQuery, fetchStopTrees, fetchTransitiveNetwork, setAccessibilityForGrid, updateOrigin} from '../../actions/browsochrones'
import CanvasTileLayer from '../../components/canvas-tile-layer'
import DestinationsSelect from '../../components/destinations-select'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
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

  /**
   * Callback to be executed on Origin Marker move. Update Browsochones when
   * Marker is dropped
   *
   * @private
   * @param  {Event} event
   */
  moveOrigin (latlng, label) {
    const {dispatch, browsochrones, destinations} = this.props
    const origin = this.browsochrones.pixelToOriginCoordinates(this.map.project(latlng), this.map.getZoom())

    dispatch(addActionLogItem(`Origin marker moved to [${lonlng.print(latlng)}]`))

    dispatch(updateMapMarker({
      origin: {
        latlng,
        label
      }
    }))

    dispatch(updateOrigin({
      browsochrones: this.browsochrones,
      grid: browsochrones.grids[destinations.selected],
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

  latlngKey () {
    const {mapMarkers} = this.props
    const {destination, origin} = mapMarkers
    if (destination) return `${JSON.stringify(origin.latlng)}-${JSON.stringify(destination.latlng)}`
    return JSON.stringify(origin.latlng)
  }

  renderMap ({ transitiveData }) {
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
        {transitiveData &&
          <TransitiveLayer
            key={`transitive-${this.latlngKey()}`}
            data={transitiveData}
            styles={transitiveStyle}
            />
        }
      </Map>
    )
  }

  changeStartAddress (input) {
    if (!input) return
    const { label, value } = input
    const latlng = lonlng(value)
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
      const latlng = lonlng(value)
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
    const {browsochrones, dispatch, map, mapMarkers} = this.props
    const {accessibility, grids} = browsochrones

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
          <label>Access to <strong>{accessibility.toLocaleString()}</strong></label>
          <DestinationsSelect
            className='form-control'
            onChange={event => {
              dispatch(updateSelectedDestination(event.target.value))
              dispatch(setAccessibilityForGrid({browsochrones: this.browsochrones, grid: grids[event.target.value]}))
            }}
            />
        </fieldset>
        <fieldset className='form-group'>
          <label>Isoline Time Cutoff</label>
          <TimeCutoffSelect className='form-control' />
        </fieldset>
      </form>
    )

    function markerToValue (m) {
      return m && m.label && m.latlng
        ? {label: m.label, value: lonlng.toString(m.latlng)}
        : null
    }
  }

  render () {
    const destinationData = this.generateDestinationData()

    return (
      <Fullscreen>
        {this.renderMap({ transitiveData: destinationData.transitiveData })}
        <Dock
          dimMode='none'
          fluid
          isVisible
          position='right'
          dockStyle={{
            backgroundColor: '#6492d9'
          }}
          >
          <div className={styles.dockContent}>
            {this.renderForm()}
            {this.renderPaths(destinationData)}
          </div>
          <div className={styles.dockedActionLog}><Log /></div>
        </Dock>
      </Fullscreen>
    )
  }

  generateDestinationData () {
    const {mapMarkers} = this.props
    if (this.browsochrones.isLoaded() && mapMarkers.origin.latlng && mapMarkers.destination.latlng) {
      const point = this.browsochrones.pixelToOriginCoordinates(this.map.project(mapMarkers.destination.latlng), this.map.getZoom())
      const transitiveData = this.browsochrones.generateTransitiveData(point)
      const travelTime = this.browsochrones.surface.surface[point.y * this.browsochrones.query.width + point.x]

      return { transitiveData, travelTime }
    } else {
      return false
    }
  }

  renderPaths (destinationData) {
    if (!destinationData) return null

    const journeys = extractRelevantTransitiveInfo(destinationData.transitiveData)

    return (
      <div className={styles.RouteCard}>
        <div className={styles.RouteCardTitle}>Current Options — {destinationData.travelTime} minute trip</div>
        <div className={styles.RouteCardContent}>
          {journeys.map((segments, jindex) => {
            return (
              <div key={`journey-${jindex}`}>
                <span className={styles.RouteCardSegmentIndex}>{jindex + 1}</span>
                {segments.map((s, sindex) => {
                  return (
                    <span
                      className={styles.RouteCardSegment}
                      key={`journey-${jindex}-segment-${sindex}`}
                      style={{
                        backgroundColor: (s.backgroundColor || 'inherit'),
                        color: (s.color || 'inherit')
                      }}
                      >
                      <i className='fa fa-bus'></i> {s.name}
                    </span>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  log (l) {
    const {dispatch} = this.props
    dispatch(addActionLogItem(l))
  }
}

function extractRelevantTransitiveInfo (transitive) {
  return transitive.journeys.map(j => {
    return j.segments.filter(s => !!s.pattern_id).map(s => {
      const seg = {
        type: s.type.toLowerCase()
      }
      seg.color = '#333'

      if (s.from_stop_index) seg.from = transitive.stops[s.from_stop_index].stop_name
      if (s.to_stop_index) seg.to = transitive.stops[s.to_stop_index].stop_name

      if (s.from) {
        if (s.from.stop_id) seg.from = transitive.stops[parseInt(s.from.stop_id, 10)].stop_name
        else seg.start = true
      }
      if (s.to) {
        if (s.to.stop_id) seg.to = transitive.stops[parseInt(s.to.stop_id, 10)].stop_name
        else seg.end = true
      }

      const route = transitive.routes[parseInt(transitive.patterns[parseInt(s.pattern_id, 10)].route_id, 10)]
      const color = Color(`#${route.route_color}`)
      seg.name = route.route_long_name
      seg.backgroundColor = color.rgbaString()
      seg.color = color.light() ? '#000' : '#fff'

      return seg
    })
  })
}

export default connect(s => s)(Indianapolis)
