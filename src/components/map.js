// @flow
import {Browser, LatLng} from 'leaflet'
import {mapbox} from 'mapbox.js'
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

import type {Coordinate, Feature, MapEvent, PointsOfInterest} from '../types'

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
  pointsOfInterest: PointsOfInterest,
  setEnd(any): void,
  setStart(any): void,
  transitive: any,
  zoom: number
}

type State = {
  showSelectStartOrEnd: boolean,
  lastClickedLabel: null,
  lastClickedLatlng: null | LatLng
}

export default class Map extends PureComponent<void, Props, State> {
  state = {
    showSelectStartOrEnd: false,
    lastClickedLabel: null,
    lastClickedLatlng: null
  }

  _clearState () {
    this.setState({
      showSelectStartOrEnd: false,
      lastClickedLabel: null,
      lastClickedLatlng: null
    })
  }

  _clearStartAndEnd = () => {
    const {clearStartAndEnd} = this.props
    clearStartAndEnd()
    this._clearState()
  }

  _onMapClick = (e: MapEvent) => {
    this.setState({
      showSelectStartOrEnd: !this.state.showSelectStartOrEnd,
      lastClickedLatlng: e.latlng
    })
  }

  _setEnd = () => {
    const {setEnd} = this.props
    const {lastClickedLatlng} = this.state
    setEnd({latlng: lastClickedLatlng})
    this._clearState()
  }

  _setStart = () => {
    const {setStart} = this.props
    const {lastClickedLatlng} = this.state
    setStart({latlng: lastClickedLatlng})
    this._clearState()
  }

  _clickPoi = (event: Event & {layer: {feature: Feature}}) => {
    if (!event.layer || !event.layer.feature) {
      return this._clearState()
    }

    const {feature} = event.layer
    const {coordinates} = feature.geometry
    this.setState({
      lastClickedLabel: feature.properties.label,
      lastClickedLatlng: {lat: coordinates[1], lng: coordinates[0]},
      showSelectStartOrEnd: true
    })
  }

  render () {
    const {
      centerCoordinates,
      geojson,
      geojsonColor,
      markers,
      pointsOfInterest,
      transitive,
      zoom
    } = this.props
    const {
      lastClickedLabel,
      lastClickedLatlng,
      showSelectStartOrEnd
    } = this.state
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
        preferCanvas
        zoomControl={false}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url={TILE_LAYER_URL}
          attribution={process.env.LEAFLET_ATTRIBUTION}
          {...tileLayerProps}
        />
        {markers.length < 2 &&
          <MapboxGeoJson
            data={pointsOfInterest.map(poi => poi.feature)}
            onClick={this._clickPoi}
          />}

        {markers.map((m, index) => (
          <Marker
            draggable
            icon={index === 0 ? startIcon : endIcon}
            key={`marker-${index}`}
            onDragEnd={m.onDragEnd}
            position={m.position}
          >
            {m.label && <Popup><span>{m.label}</span></Popup>}
          </Marker>
        ))}

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
              {lastClickedLabel && <h3>{lastClickedLabel}</h3>}
              <button onClick={this._setStart}>
                <Icon type='map-marker' />
                {' '}
                {messages.Map.SetLocationPopup.SetStart}
              </button>
              {markers.length > 0 &&
                <button onClick={this._setEnd}>
                  <Icon type='map-marker' />
                  {' '}
                  {messages.Map.SetLocationPopup.SetEnd}
                </button>}
              {markers.length > 0 &&
                <button onClick={this._clearStartAndEnd}>
                  <Icon type='times' />
                  {' '}
                  {messages.Map.SetLocationPopup.ClearMarkers}
                </button>}
            </div>
          </Popup>}
      </LeafletMap>
    )
  }
}

mapbox.accessToken = process.env.MAPBOX_ACCESS_TOKEN
class MapboxGeoJson extends GeoJson {
  componentWillMount () {
    super.componentWillMount()
    const {data} = this.props
    this.leafletElement = mapbox.featureLayer(data)
  }
}
