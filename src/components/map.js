import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import {Browser} from 'leaflet'
import React, {PropTypes} from 'react'
import {GeoJSON, Map as LeafletMap, Marker, Popup, TileLayer, ZoomControl} from 'react-leaflet'

import leafletIcon from '../utils/leaflet-icons'
import messages from '../utils/messages'
import TransitiveLayer from './transitive-map-layer'
import transitiveStyle from '../transitive-style'

const TILE_LAYER_URL = Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL
const TILE_LAYER_PROPS = Browser.retina
  ? {tileSize: 512, zoomOffset: -1}
  : {}

const startIcon = leafletIcon({
  icon: 'play',
  markerColor: 'darkblue'
})

const endIcon = leafletIcon({
  icon: 'stop',
  markerColor: 'orange'
})

export default class Map extends Pure {
  static propTypes = {
    centerCoordinates: PropTypes.arrayOf(PropTypes.number),
    clearStartAndEnd: PropTypes.func.isRequired,
    geojson: PropTypes.arrayOf(PropTypes.object).isRequired,
    geojsonColor: PropTypes.string,
    markers: PropTypes.arrayOf(PropTypes.object).isRequired,
    onZoom: PropTypes.func,
    setEnd: PropTypes.func.isRequired,
    setStart: PropTypes.func.isRequired,
    transitive: PropTypes.object,
    zoom: PropTypes.number
  }

  state = {
    showSelectOriginOrDestination: false,
    lastClickedLatlng: null
  }

  _clearStartAndEnd = () => {
    const {clearStartAndEnd} = this.props
    clearStartAndEnd()
    this.setState({
      ...this.state,
      showSelectOriginOrDestination: false
    })
  }

  _onMapClick = (e) => {
    const {markers, setStart} = this.props
    if (markers.length === 0) {
      setStart({latlng: e.latlng})
    } else {
      this.setState({
        ...this.state,
        showSelectOriginOrDestination: !this.state.showSelectOriginOrDestination,
        lastClickedLatlng: e.latlng
      })
    }
  }

  _setEnd = () => {
    const {setEnd} = this.props
    const {lastClickedLatlng} = this.state
    setEnd({latlng: lastClickedLatlng})
    this.setState({
      showSelectOriginOrDestination: false,
      lastClickedLatlng: null
    })
  }

  _setStart = () => {
    const {setStart} = this.props
    const {lastClickedLatlng} = this.state
    setStart({latlng: lastClickedLatlng})
    this.setState({
      showSelectOriginOrDestination: false,
      lastClickedLatlng: null
    })
  }

  render () {
    const {centerCoordinates, geojson, geojsonColor, markers, onZoom, transitive, zoom} = this.props
    const {showSelectOriginOrDestination, lastClickedLatlng} = this.state

    return (
      <LeafletMap
        center={centerCoordinates}
        className='Taui-Map'
        ref='map'
        zoom={zoom}
        onClick={this._onMapClick}
        onZoom={onZoom}
        preferCanvas
        zoomControl={false}
        >
        <ZoomControl position='topright' />
        <TileLayer
          url={TILE_LAYER_URL}
          attribution={process.env.LEAFLET_ATTRIBUTION}
          {...TILE_LAYER_PROPS}
        />
        {markers.map((m, index) => {
          return (
            <Marker
              draggable
              icon={index === 0 ? startIcon : endIcon}
              key={`marker-${index}`}
              {...m}
              >
              {m.label && <Popup><span>{m.label}</span></Popup>}
            </Marker>
          )
        })}

        {geojson.map((g) => {
          return <GeoJSON
            key={`${g.key}`}
            data={g}
            style={{
              fillColor: geojsonColor,
              pointerEvents: 'none',
              stroke: geojsonColor,
              weight: 1
            }}
            />
        })}

        {transitive &&
          <TransitiveLayer
            data={transitive}
            styles={transitiveStyle}
            />
        }

        {showSelectOriginOrDestination &&
          <Popup
            closeButton={false}
            position={lastClickedLatlng}
            >
            <div className='Popup'>
              <button onClick={this._setStart}><Icon type='map-marker' /> {messages.Map.SetLocationPopup.SetStart}</button>
              <button onClick={this._setEnd}><Icon type='map-marker' /> {messages.Map.SetLocationPopup.SetEnd}</button>
              <button onClick={this._clearStartAndEnd}><Icon type='times' /> {messages.Map.SetLocationPopup.ClearMarkers}</button>
            </div>
          </Popup>
        }
      </LeafletMap>
    )
  }
}
