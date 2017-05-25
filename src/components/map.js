// @flow
import {Browser} from 'leaflet'
import React, {PureComponent} from 'react'
import {
  GeoJson,
  Map as LeafletMap,
  Marker,
  Popup,
  TileLayer,
  ZoomControl
} from 'react-leaflet'

import Icon from './icon'
import leafletIcon from '../utils/leaflet-icons'
import messages from '../utils/messages'
import TransitiveLayer from './transitive-map-layer'
import transitiveStyle from '../transitive-style'

import type {Coordinate, Feature, MapEvent} from '../types'

const TILE_LAYER_URL = Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL

const startIcon = leafletIcon({
  icon: 'play',
  markerColor: 'darkblue'
})

const endIcon = leafletIcon({
  icon: 'stop',
  markerColor: 'orange'
})

type Props = {
  centerCoordinates: Coordinate,
  clearStartAndEnd(): void,
  geojson: Feature[],
  geojsonColor: string,
  markers: any[],
  onZoom(): void,
  setEnd(): void,
  setStart(): void,
  transitive: any,
  zoom: number
}

type State = {
  showSelectStartOrEnd: boolean,
  lastClickedLatlng: null | Coordinate
}

export default class Map extends PureComponent<void, Props, State> {
  state = {
    showSelectStartOrEnd: false,
    lastClickedLatlng: null
  }

  _clearStartAndEnd = () => {
    const {clearStartAndEnd} = this.props
    clearStartAndEnd()
    this.setState({
      showSelectStartOrEnd: false
    })
  }

  _onMapClick = (e: MapEvent) => {
    const {markers, setStart} = this.props
    if (markers.length === 0) {
      setStart({latlng: e.latlng})
    } else {
      this.setState({
        showSelectStartOrEnd: !this.state.showSelectStartOrEnd,
        lastClickedLatlng: e.latlng
      })
    }
  }

  _setEnd = () => {
    const {setEnd} = this.props
    const {lastClickedLatlng} = this.state
    setEnd({latlng: lastClickedLatlng})
    this.setState({
      showSelectStartOrEnd: false,
      lastClickedLatlng: null
    })
  }

  _setStart = () => {
    const {setStart} = this.props
    const {lastClickedLatlng} = this.state
    setStart({latlng: lastClickedLatlng})
    this.setState({
      showSelectStartOrEnd: false,
      lastClickedLatlng: null
    })
  }

  render () {
    const {
      centerCoordinates,
      geojson,
      geojsonColor,
      markers,
      onZoom,
      transitive,
      zoom
    } = this.props
    const {showSelectStartOrEnd, lastClickedLatlng} = this.state
    const tileLayerProps = {}

    if (Browser.retina) {
      tileLayerProps.tileSize = 512
      tileLayerProps.zoomOffset = -1
    }

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
          {...tileLayerProps}
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

        {geojson.map(g => {
          return (
            <GeoJson
              key={`${g.key}`}
              data={g}
              style={{
                fillColor: geojsonColor,
                pointerEvents: 'none',
                stroke: geojsonColor,
                weight: 1
              }}
            />
          )
        })}

        {transitive &&
          <TransitiveLayer data={transitive} styles={transitiveStyle} />}

        {showSelectStartOrEnd &&
          <Popup closeButton={false} position={lastClickedLatlng}>
            <div className='Popup'>
              <button onClick={this._setStart}>
                <Icon type='map-marker' />
                {' '}
                {messages.Map.SetLocationPopup.SetStart}
              </button>
              <button onClick={this._setEnd}>
                <Icon type='map-marker' />
                {' '}
                {messages.Map.SetLocationPopup.SetEnd}
              </button>
              <button onClick={this._clearStartAndEnd}>
                <Icon type='times' />
                {' '}
                {messages.Map.SetLocationPopup.ClearMarkers}
              </button>
            </div>
          </Popup>}
      </LeafletMap>
    )
  }
}
