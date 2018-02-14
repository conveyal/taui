// @flow
import lonlat from '@conveyal/lonlat'
import message from '@conveyal/woonerf/message'
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
import TransitiveLayer from './transitive-map-layer'
import transitiveStyle from '../transitive-style'

import type {Coordinate, Feature, LonLat, MapEvent, PointsOfInterest} from '../types'

const TILE_URL = Browser.retina && process.env.LEAFLET_RETINA_URL
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
  activeNetworkIndex: number,
  centerCoordinates: Coordinate,
  clearStartAndEnd: () => void,
  isochrones: any[],
  markers: any[],
  pointsOfInterest: PointsOfInterest,
  setEndPosition: (LonLat) => void,
  setStartPosition: (LonLat) => void,
  transitive: any,
  updateMap: (any) => void,
  zoom: number
}

type State = {
  showSelectStartOrEnd: boolean,
  lastClickedLabel: null,
  lastClickedPosition: null | LonLat
}

export default class Map extends PureComponent {
  props: Props
  state: State

  state = {
    showSelectStartOrEnd: false,
    lastClickedLabel: null,
    lastClickedPosition: null
  }

  _clearState (): void {
    this.setState({
      showSelectStartOrEnd: false,
      lastClickedLabel: null,
      lastClickedPosition: null
    })
  }

  _clearStartAndEnd = (): void => {
    this.props.clearStartAndEnd()
    this._clearState()
  }

  _onMapClick = (e: MapEvent): void => {
    this.setState({
      showSelectStartOrEnd: !this.state.showSelectStartOrEnd,
      lastClickedPosition: lonlat(e.latlng)
    })
  }

  _setEnd = (): void => {
    if (this.state.lastClickedPosition) { this.props.setEndPosition(this.state.lastClickedPosition) }
    this._clearState()
  }

  _setStart = (): void => {
    if (this.state.lastClickedPosition) { this.props.setStartPosition(this.state.lastClickedPosition) }
    this._clearState()
  }

  _clickPoi = (event: Event & {layer: {feature: Feature}}): void => {
    if (!event.layer || !event.layer.feature) {
      return this._clearState()
    }

    const {feature} = event.layer
    const {coordinates} = feature.geometry
    this.setState({
      lastClickedLabel: feature.properties.label,
      lastClickedPosition: lonlat(coordinates),
      showSelectStartOrEnd: true
    })
  }

  _setZoom = (e: MapEvent) => {
    const zoom = e.target._zoom
    this.props.updateMap({zoom})
  }

  render (): React$Element<LeafletMap> {
    const {
      activeNetworkIndex,
      centerCoordinates,
      isochrones,
      markers,
      pointsOfInterest,
      transitive,
      zoom
    } = this.props
    const {
      lastClickedLabel,
      lastClickedPosition,
      showSelectStartOrEnd
    } = this.state
    const tileLayerProps = {}

    if (Browser.retina) {
      tileLayerProps.tileSize = 512
      tileLayerProps.zoomOffset = -1
    }

    const baseIsochrone = isochrones[0]
    const comparisonIsochrone = activeNetworkIndex > 0 ? isochrones[activeNetworkIndex] : null

    return (
      <LeafletMap
        center={centerCoordinates}
        className='Taui-Map'
        ref='map'
        onZoomend={this._setZoom}
        zoom={zoom}
        onClick={this._onMapClick}
        preferCanvas
        zoomControl={false}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url={TILE_URL}
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
            position={lonlat.toLeaflet(m.position)}
          >
            {m.label &&
              <Popup>
                <span>
                  {m.label}
                </span>
              </Popup>}
          </Marker>
        ))}

        {baseIsochrone &&
          <Isochrone isochrone={baseIsochrone} color='#4269a4' />}

        {comparisonIsochrone &&
          <Isochrone isochrone={comparisonIsochrone} color='darkorange' />}

        {transitive &&
          <TransitiveLayer data={transitive} styles={transitiveStyle} />}

        {showSelectStartOrEnd &&
          <Popup closeButton={false} position={lonlat.toLeaflet(lastClickedPosition)}>
            <div className='Popup'>
              {lastClickedLabel &&
                <h3>
                  {lastClickedLabel}
                </h3>}
              <button onClick={this._setStart}>
                <Icon type='map-marker' />{' '}
                {message('Map.SetLocationPopup.SetStart')}
              </button>
              {markers.length > 0 &&
                <button onClick={this._setEnd}>
                  <Icon type='map-marker' />{' '}
                  {message('Map.SetLocationPopup.SetEnd')}
                </button>}
              {markers.length > 0 &&
                <button onClick={this._clearStartAndEnd}>
                  <Icon type='times' />{' '}
                  {message('Map.SetLocationPopup.ClearMarkers')}
                </button>}
            </div>
          </Popup>}
      </LeafletMap>
    )
  }
}

function Isochrone ({isochrone, color}) {
  return (
    <GeoJson
      key={`${isochrone.key}`}
      data={isochrone}
      style={{
        fillColor: color,
        pointerEvents: 'none',
        stroke: color,
        weight: 1
      }}
    />
  )
}

class MapboxGeoJson extends GeoJson {
  componentWillMount () {
    const {mapbox} = require('mapbox.js')
    super.componentWillMount()
    const {data} = this.props
    mapbox.accessToken = process.env.MAPBOX_ACCESS_TOKEN
    this.leafletElement = mapbox.featureLayer(data)
  }
}
